import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { User, Calendar } from 'lucide-react';
import { useState } from 'react';

export default function BlogCard({ post }) {
    const [imgSrc, setImgSrc] = useState(post.coverImage);
    const [imgError, setImgError] = useState(false);

    // Safe date formatting
    const formatDate = (timestamp) => {
        if (!timestamp) return 'Recently';
        return format(timestamp.toDate(), 'MMM d, yyyy');
    };

    // Strip HTML tags for summary
    const createExcerpt = (html) => {
        const tmp = document.createElement('DIV');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    };

    const handleImageError = () => {
        setImgError(true);
        setImgSrc('https://images.unsplash.com/photo-1499750310159-5b5f8f9460a5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80');
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden flex flex-col h-full">
            {/* Show image if coverImage exists (as string) OR if we have a fallback ready, 
          but if it broke and we set a fallback, we want to ensure we show THAT. 
          Actually simpler: if post.coverImage is truthy, we try to render it. 
          If it errors, handleImageError swaps the source. 
      */}
            {post.coverImage && (
                <div className="h-48 w-full overflow-hidden bg-gray-100">
                    <img
                        src={imgError ? imgSrc : post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        onError={handleImageError}
                    />
                </div>
            )}
            <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center text-xs text-gray-500 mb-3 space-x-4">
                    <div className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        <span>{post.author.name}</span>
                    </div>
                    <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{formatDate(post.createdAt)}</span>
                    </div>
                </div>

                <Link to={`/post/${post.id}`} className="block mt-2">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {post.title}
                    </h3>
                </Link>

                <p className="mt-3 text-gray-500 text-sm line-clamp-3 flex-1">
                    {createExcerpt(post.content).substring(0, 150)}...
                </p>

                <div className="mt-6 pt-4 border-t border-gray-50">
                    <Link
                        to={`/post/${post.id}`}
                        className="text-indigo-600 hover:text-indigo-700 font-medium text-sm inline-flex items-center"
                    >
                        Read Article &rarr;
                    </Link>
                </div>
            </div>
        </div>
    );
}
