import { useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { db, storage } from '../firebase_config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ImagePlus, Save, Link as LinkIcon } from 'lucide-react';

export default function CreatePost() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [imageUrlInput, setImageUrlInput] = useState('');
    const [loading, setLoading] = useState(false);
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

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'indent',
        'link', 'image'
    ];

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

        setLoading(true);
        try {
            let finalImageUrl = null;

            // Prioritize File upload if present (and storage works)
            if (image) {
                try {
                    finalImageUrl = await handleImageUpload(image);
                } catch (err) {
                    console.error("Storage upload failed (likely billing/config)", err);
                    toast.error("Image upload failed. Try using a link instead.");
                    setLoading(false);
                    return;
                }
            } else if (imageUrlInput) {
                // Fallback to URL input
                finalImageUrl = imageUrlInput;
            }

            await addDoc(collection(db, 'posts'), {
                title,
                content,
                coverImage: finalImageUrl,
                author: {
                    name: currentUser.email.split('@')[0],
                    id: currentUser.uid,
                    email: currentUser.email
                },
                createdAt: serverTimestamp(),
                commentsCount: 0
            });

            toast.success('Blog post published!');
            navigate('/');
        } catch (error) {
            console.error("Error adding document: ", error);
            toast.error(`Failed: ${error.message}`);
        }
        setLoading(false);
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 border-b pb-4">Create New Story</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title Input */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                            Title
                        </label>
                        <input
                            type="text"
                            id="title"
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-lg px-4 py-2 border"
                            placeholder="Enter your engaging title..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    {/* Image Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cover Image (Optional)
                        </label>
                        <div className="space-y-3">
                            {/* File Upload Option */}
                            <div className="flex items-center space-x-4">
                                <label className={`cursor-pointer inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${imageUrlInput ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'}`}>
                                    <ImagePlus className="h-5 w-5 mr-2" />
                                    <span>Upload File</span>
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

                            {/* URL Input Option */}
                            <div className="flex items-center space-x-2">
                                <LinkIcon className="h-5 w-5 text-gray-400" />
                                <input
                                    type="url"
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                                    placeholder="Paste an image URL (e.g., https://images.unsplash.com/...)"
                                    value={imageUrlInput}
                                    disabled={!!image}
                                    onChange={(e) => setImageUrlInput(e.target.value)}
                                />
                            </div>
                            <p className="text-xs text-gray-500">
                                Use a URL if you don't have Firebase Storage enabled.
                            </p>
                        </div>
                    </div>

                    {/* Rich Text Editor */}
                    <div className="prose-editor">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Content
                        </label>
                        <ReactQuill
                            theme="snow"
                            value={content}
                            onChange={setContent}
                            modules={modules}
                            formats={formats}
                            className="h-64 mb-12"
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-8">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-md disabled:opacity-50"
                        >
                            <Save className="h-5 w-5 mr-2" />
                            {loading ? 'Publishing...' : 'Publish Story'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
