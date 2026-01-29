import { useState, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { db, storage } from '../firebase_config';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ImagePlus, Save, Link as LinkIcon } from 'lucide-react';

export default function EditPost() {
    const { id } = useParams();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [imageUrlInput, setImageUrlInput] = useState('');
    const [currentImageUrl, setCurrentImageUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
            ['link', 'image'],
            ['clean']
        ],
    };

    useEffect(() => {
        async function fetchPost() {
            try {
                const docRef = doc(db, 'posts', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (currentUser.uid !== data.author.id) {
                        toast.error("You don't have permission to edit this post");
                        navigate('/');
                        return;
                    }
                    setTitle(data.title);
                    setContent(data.content);
                    setCurrentImageUrl(data.coverImage);
                } else {
                    toast.error('Post not found');
                    navigate('/');
                }
            } catch (error) {
                console.error("Error fetching post:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchPost();
    }, [id, currentUser, navigate]);

    async function handleImageUpload(imageFile) {
        if (!imageFile) return null;
        const storageRef = ref(storage, `blog-covers/${Date.now()}_${imageFile.name}`);
        const snapshot = await uploadBytes(storageRef, imageFile);
        return await getDownloadURL(snapshot.ref);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!title || !content) {
            return toast.error('Title and content are required');
        }

        setUpdating(true);
        try {
            let finalImageUrl = currentImageUrl;

            // Prioritize File upload
            if (image) {
                try {
                    finalImageUrl = await handleImageUpload(image);
                } catch (err) {
                    console.error("Storage upload failed", err);
                    toast.error("Image upload failed. Try using a link.");
                    setUpdating(false);
                    return;
                }
            } else if (imageUrlInput) {
                // If new URL is provided, use it
                finalImageUrl = imageUrlInput;
            }

            const docRef = doc(db, 'posts', id);
            await updateDoc(docRef, {
                title,
                content,
                coverImage: finalImageUrl,
                updatedAt: serverTimestamp()
            });

            toast.success('Blog post updated!');
            navigate(`/post/${id}`);
        } catch (error) {
            console.error("Error updating document: ", error);
            toast.error('Failed to update post');
        }
        setUpdating(false);
    }

    if (loading) return <div className="text-center py-10">Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 border-b pb-4">Edit Story</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                            Title
                        </label>
                        <input
                            type="text"
                            id="title"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-lg px-4 py-2 border"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cover Image
                        </label>
                        <div className="space-y-4">
                            {currentImageUrl && !image && !imageUrlInput && (
                                <div className="w-full h-48 rounded-lg overflow-hidden bg-gray-100 relative group">
                                    <img src={currentImageUrl} alt="Current cover" className="w-full h-full object-cover" />
                                </div>
                            )}

                            <div className="space-y-3">
                                <div className="flex items-center space-x-4">
                                    <label className={`cursor-pointer inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${imageUrlInput ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'}`}>
                                        <ImagePlus className="h-5 w-5 mr-2" />
                                        <span>{currentImageUrl ? 'Change File' : 'Upload File'}</span>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            disabled={!!imageUrlInput}
                                            onChange={(e) => setImage(e.target.files[0])}
                                        />
                                    </label>
                                    {image && <span className="text-sm text-gray-500">{image.name}</span>}
                                </div>

                                <div className="relative flex py-2 items-center">
                                    <div className="flex-grow border-t border-gray-200"></div>
                                    <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase">Or</span>
                                    <div className="flex-grow border-t border-gray-200"></div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <LinkIcon className="h-5 w-5 text-gray-400" />
                                    <input
                                        type="url"
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                                        placeholder="Paste new image URL..."
                                        value={imageUrlInput}
                                        disabled={!!image}
                                        onChange={(e) => setImageUrlInput(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="prose-editor">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Content
                        </label>
                        <ReactQuill
                            theme="snow"
                            value={content}
                            onChange={setContent}
                            modules={modules}
                            className="h-64 mb-12"
                        />
                    </div>

                    <div className="pt-8 flex justify-end">
                        <button
                            type="submit"
                            disabled={updating}
                            className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-md disabled:opacity-50"
                        >
                            <Save className="h-5 w-5 mr-2" />
                            {updating ? 'Updating...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
