import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase_config';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { User, Calendar, Edit, Trash2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import CommentSection from '../components/CommentSection';

export default function PostDetail() {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchPost() {
            try {
                const docRef = doc(db, 'posts', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setPost({ id: docSnap.id, ...docSnap.data() });
                } else {
                    toast.error('Post not found');
                    navigate('/');
                }
            } catch (error) {
                console.error("Error fetching post:", error);
                toast.error('Error loading post');
            } finally {
                setLoading(false);
            }
        }

        fetchPost();
    }, [id, navigate]);

    async function handleDelete() {
        if (window.confirm('Are you sure you want to delete this post?')) {
            try {
                await deleteDoc(doc(db, 'posts', id));
                toast.success('Post deleted successfully');
                navigate('/');
            } catch (error) {
                console.error("Error deleting post:", error);
                toast.error('Failed to delete post');
            }
        }
    }

    if (loading) return <div className="text-center py-10">Loading...</div>;
    if (!post) return null;

    const isAuthor = currentUser && currentUser.uid === post.author.id;

    return (
        <div className="max-w-4xl mx-auto">
            <Link to="/" className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-6 font-medium">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Stories
            </Link>

            <article className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {post.coverImage && (
                    <div className="w-full h-64 sm:h-96">
                        <img
                            src={post.coverImage}
                            alt={post.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                <div className="p-6 sm:p-10">
                    <div className="flex justify-between items-start mb-6">
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
                            {post.title}
                        </h1>
                        {isAuthor && (
                            <div className="flex space-x-2 ml-4 flex-shrink-0">
                                <Link
                                    to={`/edit-post/${post.id}`}
                                    className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                                    title="Edit Post"
                                >
                                    <Edit className="h-5 w-5" />
                                </Link>
                                <button
                                    onClick={handleDelete}
                                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                    title="Delete Post"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center text-sm text-gray-500 mb-8 pb-8 border-b border-gray-100">
                        <div className="flex items-center mr-6">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold mr-3">
                                {post.author.name[0].toUpperCase()}
                            </div>
                            <div>
                                <span className="block font-medium text-gray-900">{post.author.name}</span>
                                <span className="block text-xs">Author</span>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            {post.createdAt ? format(post.createdAt.toDate(), 'MMMM d, yyyy') : 'Recently'}
                        </div>
                    </div>

                    <div
                        className="prose prose-indigo max-w-none"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                </div>
            </article>

            {/* Comment Section */}
            <div className="mt-8">
                <CommentSection postId={id} />
            </div>
        </div>
    );
}
