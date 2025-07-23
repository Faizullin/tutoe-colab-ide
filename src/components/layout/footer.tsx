import { Code } from "lucide-react";
import Link from "next/link";

function Footer() {
    return (
        <footer className="py-8 sm:py-10 md:py-12 border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
                    <div className="text-center md:text-left">
                        <h2 className="text-xl sm:text-2xl font-bold flex items-center justify-center md:justify-start">
                            <Code className="mr-2 text-emerald-400" /> TutorIDE
                        </h2>
                        {/* <p className="text-gray-400 mt-2 text-sm sm:text-base">© 2025 CodeX. All rights reserved.</p> */}
                    </div>
                    <div className="w-full md:w-auto flex flex-col md:flex-row items-center justify-center md:justify-end gap-6 sm:gap-8 md:gap-10">
                        <div className="flex gap-6 sm:gap-8 md:gap-10">
                            <Link href="/" className="">Home</Link>
                            <Link href="/posts" className="">Posts</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;