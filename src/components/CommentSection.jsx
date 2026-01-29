import { useState, useEffect } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase_config';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { Send, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function CommentSection({ postId }) {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const { currentUser } = useAuth();

    useEffect(() => {
        // Real-time listener for comments subcollection
        const commentsRef = collection(db, 'posts', postId, 'comments');
        const q = query(commentsRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const commentsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setComments(commentsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching comments:", error);
            setLoading(false);
        });

        return unsubscribe;
    }, [postId]);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!newComment.trim()) return;

        setSubmitting(true);
        try {
            const commentsRef = collection(db, 'posts', postId, 'comments');
            await addDoc(commentsRef, {
                text: newComment,
                author: {
                    name: currentUser.email.split('@')[0],
                    id: currentUser.uid
                },
                createdAt: serverTimestamp()
            });
            setNewComment('');
            toast.success('Comment added');
        } catch (error) {
            console.error("Error adding comment:", error);
            toast.error('Failed to add comment');
        }
        setSubmitting(false);
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
                Comments ({comments.length})
            </h3>

            {/* Add Comment Form */}
            {currentUser ? (
                <form onSubmit={handleSubmit} className="mb-8">
                    <div className="relative">
                        <textarea
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-4 border resize-none"
                            rows="3"
                            placeholder="Join the discussion..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            required
                        />
                        <button
                            type="submit"
                            disabled={submitting || !newComment.trim()}
                            className="absolute bottom-3 right-3 inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            <Send className="h-4 w-4" />
                        </button>
                    </div>
                </form>
            ) : (
                <div className="mb-8 p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-gray-600">
                        Please <Link to="/login" className="text-indigo-600 font-medium hover:underline">log in</Link> to leave a comment.
                    </p>
                </div>
            )}

            {/* Comments List */}
            <div className="space-y-6">
                {loading ? (
                    <div className="text-center text-gray-400">Loading comments...</div>
                ) : comments.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No comments yet. Be the first to share your thoughts!</p>
                ) : (
                    comments.map(comment => (
                        <div key={comment.id} className="flex space-x-4">
                            <div className="flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                    <User className="h-6 w-6" />
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-semibold text-gray-900">{comment.author.name}</span>
                                        <span className="text-xs text-gray-500">
                                            {comment.createdAt ? formatDistanceToNow(comment.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
                                        </span>
                                    </div>
                                    <p className="text-gray-700 text-sm whitespace-pre-wrap">{comment.text}</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
