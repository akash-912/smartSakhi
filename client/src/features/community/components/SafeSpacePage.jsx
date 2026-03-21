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
import { motion, AnimatePresence } from 'framer-motion';

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
  
  const [newPost, setNewPost] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [userLikes, setUserLikes] = useState(new Set()); 
  const [generatingAIFor, setGeneratingAIFor] = useState(null);

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
      .select(`id, user_id, content, is_anonymous, author_name, created_at, community_replies ( id, user_id, content, author_name, created_at, likes_count )`)
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

  const handlePostSubmit = async () => {
    if (!newPost.trim() || !user) return;
    const authorName = isAnonymous ? 'Anonymous Member' : userName;
    const { data, error } = await supabase
      .from('community_posts')
      .insert([{ user_id: user.id, content: newPost, is_anonymous: isAnonymous, author_name: authorName }])
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
      .insert([{ post_id: postId, user_id: user.id, content: replyText, author_name: userName }])
      .select();

    if (!error && data) {
      const updatedPosts = posts.map(post => {
        if (post.id === postId) return { ...post, community_replies: [...post.community_replies, { ...data[0], likes_count: 0 }] };
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
    const newLikes = new Set(userLikes);
    if (isCurrentlyLiked) newLikes.delete(replyId);
    else newLikes.add(replyId);
    setUserLikes(newLikes);

    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          community_replies: post.community_replies.map(reply => {
            if (reply.id === replyId) return { ...reply, likes_count: isCurrentlyLiked ? Math.max(0, (reply.likes_count || 0) - 1) : (reply.likes_count || 0) + 1 };
            return reply;
          })
        };
      }
      return post;
    }));

    await supabase.rpc('toggle_reply_like', { r_id: replyId, r_author_id: replyAuthorId, r_author_name: replyAuthorName, liker_id: user.id });
    fetchLeaderboard();
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    const { error } = await supabase.from('community_posts').delete().eq('id', postId).eq('user_id', user.id); 
    if (!error) setPosts(posts.filter(post => post.id !== postId));
  };

  const handleDeleteReply = async (postId, replyId, likesCount) => {
    if (!window.confirm("Are you sure you want to delete this reply?")) return;
    const { error } = await supabase.from('community_replies').delete().eq('id', replyId).eq('user_id', user.id);
    if (!error) {
      setPosts(posts.map(post => {
        if (post.id === postId) return { ...post, community_replies: post.community_replies.filter(reply => reply.id !== replyId) };
        return post;
      }));
      if (likesCount > 0) {
        await supabase.rpc('add_compassion_points', { user_uuid: user.id, u_name: userName, points_to_add: -(likesCount * 10) });
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
        headers: { 'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant", 
          messages: [
            { role: "system", content: "You are an empathetic, comforting, and supportive peer in a college student safe-space forum. Keep your response short (2-3 sentences max), warm, and encouraging. Validate their feelings. Do not give medical advice or sound like a robot." },
            { role: "user", content: `A student posted this: "${postContent}". Please reply to them with support.` }
          ]
        })
      });

      const aiData = await response.json();
      if (!response.ok) throw new Error(`API Error: ${aiData.error?.message || response.statusText}`);

      const aiMessage = aiData.choices[0].message.content;

      const { data, error } = await supabase
        .from('community_replies')
        .insert([{ post_id: postId, user_id: user.id, content: aiMessage, author_name: '🤖 AI Companion' }])
        .select();

      if (!error && data) {
        setPosts(posts.map(post => {
          if (post.id === postId) return { ...post, community_replies: [...post.community_replies, { ...data[0], likes_count: 0 }] };
          return post;
        }));
      }
    } catch (err) {
      console.error("AI Generation Error:", err);
      alert(`AI Companion Error: ${err.message}`);
    } finally {
      setGeneratingAIFor(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
            <Sparkles className="w-8 h-8 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Safe Space</h1>
            <p className="text-zinc-400">Vent anonymously, support others, and grow together.</p>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: The Feed */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="p-4 sm:p-6 border border-zinc-800/60 shadow-lg bg-[#18181b] rounded-3xl">
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="Share what's real... (It's okay to not be okay)"
                  className="w-full resize-none border-none focus:ring-0 text-white bg-[#0a0a0a] p-4 rounded-2xl mb-4 placeholder-zinc-500 outline-none"
                  rows={3}
                />
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <label className="flex items-center gap-2 cursor-pointer group" onClick={(e) => { e.preventDefault(); setIsAnonymous(!isAnonymous); }}>
                    <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isAnonymous ? 'bg-indigo-500' : 'bg-zinc-800'}`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAnonymous ? 'translate-x-6' : 'translate-x-1'}`} />
                    </div>
                    <span className="text-sm font-medium text-zinc-400 group-hover:text-white transition-colors flex items-center gap-1">
                      <ShieldAlert className="w-4 h-4" /> Post Anonymously
                    </span>
                  </label>
                  
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                    <Button onClick={handlePostSubmit} disabled={!newPost.trim()} className="w-full sm:w-auto bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl gap-2 px-6 border-none disabled:opacity-50 transition-all">
                      <Send className="w-4 h-4" /> Share
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Posts Feed */}
            <div className="space-y-6">
              {posts.length === 0 ? (
                <div className="text-center text-zinc-500 py-12">No posts yet. Be the first to share!</div>
              ) : (
                <AnimatePresence>
                  {posts.map((post) => (
                    <motion.div 
                      key={post.id} layout 
                      initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                      className="space-y-3"
                    >
                      <div className={`p-5 sm:p-6 shadow-lg rounded-3xl border border-zinc-800/60 ${post.is_anonymous ? 'bg-indigo-500/5' : 'bg-[#18181b]'}`}>
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${post.is_anonymous ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                              {post.is_anonymous ? <ShieldAlert className="w-5 h-5" /> : <UserCircle2 className="w-6 h-6" />}
                            </div>
                            <div>
                              <p className="font-semibold text-white">{post.author_name}</p>
                              <p className="text-xs text-zinc-500">{getRelativeTime(post.created_at)}</p>
                            </div>
                          </div>
                          
                          {post.user_id === user?.id && (
                            <motion.button whileHover={{ scale: 1.1, rotate: 10 }} whileTap={{ scale: 0.9 }} onClick={() => handleDeletePost(post.id)} className="p-2 text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-full transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          )}
                        </div>
                        
                        <p className="text-zinc-300 leading-relaxed mb-4 whitespace-pre-wrap">{post.content}</p>
                        
                        <div className="flex items-center gap-6 text-zinc-500">
                          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setActiveReplyId(activeReplyId === post.id ? null : post.id)} className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors">
                            <MessageCircle className="w-5 h-5" /> <span className="text-sm">{post.community_replies?.length || 0} Reply</span>
                          </motion.button>

                          <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleAISupport(post.id, post.content)} disabled={generatingAIFor === post.id} className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors disabled:opacity-50">
                            {generatingAIFor === post.id ? <Loader2 className="w-5 h-5 animate-spin text-emerald-500" /> : <Bot className="w-5 h-5" />}
                            <span className="text-sm hidden sm:inline">{generatingAIFor === post.id ? 'Thinking...' : 'AI Comfort'}</span>
                          </motion.button>
                        </div>
                      </div>

                      {/* Replies */}
                      <AnimatePresence>
                        {post.community_replies && post.community_replies.length > 0 && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="ml-8 sm:ml-12 space-y-3 border-l-2 border-zinc-800 pl-4">
                            <AnimatePresence>
                              {post.community_replies.map(reply => (
                                <motion.div key={reply.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-[#121212] border border-zinc-800/80 p-4 rounded-2xl rounded-tl-none inline-block max-w-[90%] group">
                                  <div className="flex justify-between items-start mb-1 gap-4">
                                    <div className="flex items-baseline gap-2">
                                      <p className="text-xs font-semibold text-emerald-400">{reply.author_name}</p>
                                      <span className="text-[10px] text-zinc-500">{getRelativeTime(reply.created_at)}</span>
                                    </div>
                                    {(reply.user_id === user?.id || post.user_id === user?.id) && (
                                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDeleteReply(post.id, reply.id, reply.likes_count || 0)} className="text-zinc-600 hover:text-rose-500 transition-colors">
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </motion.button>
                                    )}
                                  </div>
                                  <p className="text-zinc-300 text-sm mb-2 whitespace-pre-wrap">{reply.content}</p>
                                  
                                  {reply.author_name !== '🤖 AI Companion' && (
                                    <div className="flex items-center gap-2">
                                      <motion.button whileTap={{ scale: 0.8 }} onClick={() => handleReplyLike(post.id, reply.id, reply.user_id, reply.author_name)} className="flex items-center gap-1 text-xs text-zinc-500 hover:text-emerald-400 transition-colors">
                                        <motion.div animate={userLikes.has(reply.id) ? { scale: [1, 1.3, 1] } : { scale: 1 }}>
                                          <Heart className={`w-3.5 h-3.5 ${userLikes.has(reply.id) ? 'fill-emerald-500 text-emerald-500' : ''}`} /> 
                                        </motion.div>
                                        {reply.likes_count || 0}
                                      </motion.button>
                                    </div>
                                  )}
                                </motion.div>
                              ))}
                            </AnimatePresence>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Reply Input */}
                      <AnimatePresence>
                        {activeReplyId === post.id && (
                          <motion.div initial={{ opacity: 0, height: 0, y: -10 }} animate={{ opacity: 1, height: 'auto', y: 0 }} exit={{ opacity: 0, height: 0, y: -10 }} className="ml-8 sm:ml-12 flex gap-2 overflow-hidden">
                            <input type="text" autoFocus placeholder="Offer some support..." className="flex-1 bg-[#0a0a0a] border border-zinc-800 focus:border-emerald-500/50 rounded-xl px-4 py-2 text-sm text-white placeholder-zinc-500 outline-none transition-shadow" value={replyText} onChange={(e) => setReplyText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleReplySubmit(post.id)} />
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button onClick={() => handleReplySubmit(post.id)} disabled={!replyText.trim()} size="sm" className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 hover:text-emerald-300 rounded-xl border border-emerald-500/30 disabled:opacity-50">Reply</Button>
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Leaderboard */}
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="sticky top-6">
              <div className="p-6 border border-orange-500/20 shadow-lg bg-orange-500/5 rounded-3xl">
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-2 bg-orange-500/20 rounded-xl"><Award className="w-6 h-6 text-orange-500" /></div>
                  <h2 className="text-xl font-bold text-orange-400">Top Helpers</h2>
                </div>
                <p className="text-sm text-zinc-400 mb-6">Earn 10 compassion points when your advice gets liked by the community.</p>
                
                <div className="space-y-4">
                  {leaderboard.length === 0 ? (
                    <p className="text-sm text-center text-zinc-600">No helpers yet.</p>
                  ) : (
                    <AnimatePresence>
                      {leaderboard.map((user, index) => (
                        <motion.div key={user.user_name} layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="flex items-center justify-between p-3 bg-[#121212] border border-zinc-800 rounded-2xl">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center font-bold text-orange-400">{index + 1}</div>
                            <p className="font-semibold text-zinc-200 truncate max-w-[100px]">{user.user_name}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <motion.span key={user.points} initial={{ scale: 1.5, color: '#f59e0b' }} animate={{ scale: 1, color: '' }} className="text-sm font-bold text-orange-500">{user.points}</motion.span>
                            <span>🌟</span>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
}