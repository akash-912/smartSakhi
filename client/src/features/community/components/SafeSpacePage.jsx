import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../auth/hooks/useAuth';
import { Card } from '../../../components/ui/Card.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { 
  Heart, MessageCircle, ShieldAlert, Send, 
  Sparkles, Award, UserCircle2, Trash2, 
  Bot, Loader2 
} from 'lucide-react';

const getRelativeTime = (dateString) => {
  if (!dateString) return 'Just now';
  const diffInSeconds = Math.floor((new Date() - new Date(dateString)) / 1000);
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

export function SafeSpacePage({ userName }) {
  const { user } = useAuth();
  
  // UI States
  const [newPost, setNewPost] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [userLikes, setUserLikes] = useState(new Set()); 
  const [generatingAIFor, setGeneratingAIFor] = useState(null);

  // Data States
  const [posts, setPosts] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    const { data: postsData } = await supabase
      .from('community_posts')
      .select(`
        id, user_id, content, is_anonymous, author_name, created_at,
        community_replies ( id, user_id, content, author_name, created_at, likes_count )
      `)
      .order('created_at', { ascending: false });

    if (postsData) setPosts(postsData);
    await fetchLeaderboard();
    setLoading(false);
  };

  const fetchLeaderboard = async () => {
    const { data: leaderData } = await supabase
      .from('compassion_points')
      .select('user_name, points')
      .order('points', { ascending: false })
      .limit(5);

    if (leaderData) setLeaderboard(leaderData);
  };

  // --- ACTIONS ---

  const handlePostSubmit = async () => {
    if (!newPost.trim() || !user) return;
    
    const authorName = isAnonymous ? 'Anonymous Member' : userName;
    
    const { data, error } = await supabase
      .from('community_posts')
      .insert([{
        user_id: user.id,
        content: newPost,
        is_anonymous: isAnonymous,
        author_name: authorName
      }])
      .select();

    if (!error && data) {
      setPosts([{ ...data[0], community_replies: [] }, ...posts]);
      setNewPost('');
      setIsAnonymous(false);
    }
  };

  const handleReplySubmit = async (postId) => {
    if (!replyText.trim() || !user) return;

    const { data, error } = await supabase
      .from('community_replies')
      .insert([{
        post_id: postId,
        user_id: user.id,
        content: replyText,
        author_name: userName
      }])
      .select();

    if (!error && data) {
      const updatedPosts = posts.map(post => {
        if (post.id === postId) {
          return { ...post, community_replies: [...post.community_replies, { ...data[0], likes_count: 0 }] };
        }
        return post;
      });
      setPosts(updatedPosts);
      setReplyText('');
      setActiveReplyId(null);
    }
  };

  const handleReplyLike = async (postId, replyId, replyAuthorId, replyAuthorName) => {
    if (!user) return;

    const isCurrentlyLiked = userLikes.has(replyId);
    
    // Update local memory
    const newLikes = new Set(userLikes);
    if (isCurrentlyLiked) {
      newLikes.delete(replyId);
    } else {
      newLikes.add(replyId);
    }
    setUserLikes(newLikes);

    // Optimistic UI Update
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          community_replies: post.community_replies.map(reply => {
            if (reply.id === replyId) {
              return { 
                ...reply, 
                likes_count: isCurrentlyLiked 
                  ? Math.max(0, (reply.likes_count || 0) - 1) 
                  : (reply.likes_count || 0) + 1 
              };
            }
            return reply;
          })
        };
      }
      return post;
    }));

    // Trigger SQL logic
    await supabase.rpc('toggle_reply_like', { 
      r_id: replyId, 
      r_author_id: replyAuthorId, 
      r_author_name: replyAuthorName,
      liker_id: user.id 
    });

    fetchLeaderboard();
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    const { error } = await supabase
      .from('community_posts')
      .delete()
      .eq('id', postId)
      .eq('user_id', user.id); 

    if (!error) {
      setPosts(posts.filter(post => post.id !== postId));
    }
  };

  const handleDeleteReply = async (postId, replyId, likesCount) => {
    if (!window.confirm("Are you sure you want to delete this reply?")) return;

    const { error } = await supabase
      .from('community_replies')
      .delete()
      .eq('id', replyId)
      .eq('user_id', user.id);

    if (!error) {
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            community_replies: post.community_replies.filter(reply => reply.id !== replyId)
          };
        }
        return post;
      }));

      // Deduct points from leaderboard (Likes * 10)
      if (likesCount > 0) {
        const pointsToDeduct = -(likesCount * 10);
        await supabase.rpc('add_compassion_points', { 
          user_uuid: user.id, 
          u_name: userName, 
          points_to_add: pointsToDeduct 
        });
        fetchLeaderboard();
      }
    }
  };

  const handleAISupport = async (postId, postContent) => {
    if (!user) return;
    setGeneratingAIFor(postId);
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`, 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant", 
          messages: [
            { 
              role: "system", 
              content: "You are an empathetic, comforting, and supportive peer in a college student safe-space forum. Keep your response short (2-3 sentences max), warm, and encouraging. Validate their feelings. Do not give medical advice or sound like a robot." 
            },
            { 
              role: "user", 
              content: `A student posted this: "${postContent}". Please reply to them with support.` 
            }
          ]
        })
      });

      const aiData = await response.json();
      const aiMessage = aiData.choices[0].message.content;

      // Save AI reply to Supabase (using the current user's ID to satisfy DB constraints, but masking name)
      const { data, error } = await supabase
        .from('community_replies')
        .insert([{
          post_id: postId,
          user_id: user.id, 
          content: aiMessage,
          author_name: '🤖 AI Companion'
        }])
        .select();

      if (!error && data) {
        setPosts(posts.map(post => {
          if (post.id === postId) {
            return { 
              ...post, 
              community_replies: [...post.community_replies, { ...data[0], likes_count: 0 }] 
            };
          }
          return post;
        }));
      }
    } catch (err) {
      console.error("AI Generation Error:", err);
      alert("The AI Companion is currently taking a nap. Try again later!");
    } finally {
      setGeneratingAIFor(null);
    }
  };

  // --- RENDER ---

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center pt-20 bg-background transition-colors duration-200">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-200 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl">
            <Sparkles className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Safe Space</h1>
            <p className="text-muted-foreground">Vent anonymously, support others, and grow together.</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: The Feed */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Input Box */}
            <Card className="p-4 sm:p-6 border-border shadow-sm bg-card rounded-3xl">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Share what's real... (It's okay to not be okay)"
                className="w-full resize-none border-none focus:ring-0 text-foreground bg-muted/50 p-4 rounded-2xl mb-4 placeholder-muted-foreground/70"
                rows={3}
              />
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <label 
                  className="flex items-center gap-2 cursor-pointer group"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsAnonymous(!isAnonymous);
                  }}
                >
                  <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isAnonymous ? 'bg-indigo-500' : 'bg-muted-foreground/30 dark:bg-muted'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAnonymous ? 'translate-x-6' : 'translate-x-1'}`} />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <ShieldAlert className="w-4 h-4" /> Post Anonymously
                  </span>
                </label>
                
                <Button onClick={handlePostSubmit} disabled={!newPost.trim()} className="w-full sm:w-auto bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white rounded-xl gap-2 px-6 border-none disabled:opacity-50">
                  <Send className="w-4 h-4" /> Share
                </Button>
              </div>
            </Card>

            {/* Posts Feed */}
            <div className="space-y-6">
              {posts.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">No posts yet. Be the first to share!</div>
              ) : posts.map((post) => (
                <div key={post.id} className="space-y-3">
                  
                  {/* Main Post Bubble */}
                  <Card className={`p-5 sm:p-6 shadow-sm rounded-3xl border-transparent ${post.is_anonymous ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : 'bg-card border-border'}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${post.is_anonymous ? 'bg-indigo-200 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'}`}>
                          {post.is_anonymous ? <ShieldAlert className="w-5 h-5" /> : <UserCircle2 className="w-6 h-6" />}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{post.author_name}</p>
                          <p className="text-xs text-muted-foreground">{getRelativeTime(post.created_at)}</p>
                        </div>
                      </div>
                      
                      {/* Delete Post Button */}
                      {post.user_id === user?.id && (
                        <button 
                          onClick={() => handleDeletePost(post.id)}
                          className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full transition-colors"
                          title="Delete Post"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    <p className="text-foreground/90 leading-relaxed mb-4">{post.content}</p>
                    
                    <div className="flex items-center gap-6 text-muted-foreground">
                      <button onClick={() => setActiveReplyId(activeReplyId === post.id ? null : post.id)} className="flex items-center gap-1.5 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
                        <MessageCircle className="w-5 h-5" /> <span className="text-sm">{post.community_replies?.length || 0} Reply</span>
                      </button>

                      {/* AI Companion Button */}
                      <button 
                        onClick={() => handleAISupport(post.id, post.content)} 
                        disabled={generatingAIFor === post.id}
                        className="flex items-center gap-1.5 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors disabled:opacity-50"
                        title="Ask AI for some comforting words"
                      >
                        {generatingAIFor === post.id ? (
                          <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                        ) : (
                          <Bot className="w-5 h-5" />
                        )}
                        <span className="text-sm hidden sm:inline">
                          {generatingAIFor === post.id ? 'Thinking...' : 'AI Comfort'}
                        </span>
                      </button>
                    </div>
                  </Card>

                  {/* Replies Section */}
                  {post.community_replies && post.community_replies.length > 0 && (
                    <div className="ml-8 sm:ml-12 space-y-3 border-l-2 border-indigo-100 dark:border-indigo-900/50 pl-4">
                      {post.community_replies.map(reply => (
                        <div key={reply.id} className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl rounded-tl-none inline-block max-w-[90%] border border-emerald-100 dark:border-emerald-900/30 group">
                          
                          <div className="flex justify-between items-start mb-1 gap-4">
                            <div className="flex items-baseline gap-2">
                              <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-400">{reply.author_name}</p>
                              <span className="text-[10px] text-emerald-600/60 dark:text-emerald-500/50">{getRelativeTime(reply.created_at)}</span>
                            </div>
                            
                            {/* Delete Reply Button */}
                            {(reply.user_id === user?.id || post.user_id === user?.id) && (
                              <button 
                                onClick={() => handleDeleteReply(post.id, reply.id, reply.likes_count || 0)}
                                className="text-emerald-700/40 hover:text-red-500 transition-colors"
                                title="Delete Reply"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <p className="text-emerald-950 dark:text-emerald-100/90 text-sm mb-2">{reply.content}</p>
                          
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleReplyLike(post.id, reply.id, reply.user_id, reply.author_name)}
                              className="flex items-center gap-1 text-xs text-emerald-700/60 dark:text-emerald-400/60 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                            >
                              <Heart className={`w-3.5 h-3.5 ${userLikes.has(reply.id) ? 'fill-emerald-500 text-emerald-500' : ''}`} /> 
                              {reply.likes_count || 0}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply Input Box */}
                  {activeReplyId === post.id && (
                    <div className="ml-8 sm:ml-12 flex gap-2">
                      <input 
                        type="text" 
                        autoFocus
                        placeholder="Offer some support..." 
                        className="flex-1 bg-background border border-border focus:ring-2 focus:ring-indigo-500/50 rounded-xl px-4 py-2 text-sm shadow-sm text-foreground placeholder-muted-foreground"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleReplySubmit(post.id)}
                      />
                      <Button onClick={() => handleReplySubmit(post.id)} disabled={!replyText.trim()} size="sm" className="bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white rounded-xl border-none disabled:opacity-50">
                        Reply
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN: Leaderboard */}
          <div className="space-y-6">
            <Card className="p-6 border-border shadow-sm bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-900/10 rounded-3xl sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-xl">
                  <Award className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h2 className="text-xl font-bold text-orange-950 dark:text-orange-100">Top Helpers</h2>
              </div>
              <p className="text-sm text-orange-800/70 dark:text-orange-200/60 mb-6">Earn 10 compassion points when your advice gets liked by the community.</p>
              
              <div className="space-y-4">
                {leaderboard.length === 0 ? (
                  <p className="text-sm text-center text-orange-800/50 dark:text-orange-200/40">No helpers yet.</p>
                ) : leaderboard.map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/60 dark:bg-card/50 rounded-2xl backdrop-blur-sm border border-white/40 dark:border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-200 dark:bg-orange-900/60 flex items-center justify-center font-bold text-orange-700 dark:text-orange-300">
                        {index + 1}
                      </div>
                      <p className="font-semibold text-foreground truncate max-w-[100px]">{user.user_name}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold text-orange-600 dark:text-orange-400">{user.points}</span>
                      <span>🌟</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}