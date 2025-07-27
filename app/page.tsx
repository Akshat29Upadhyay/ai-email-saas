import React from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Header } from '@/components/header'
import { Brain, Search, Keyboard, ArrowRight, CheckCircle, Star, Zap, Shield, Mail } from 'lucide-react'

const LandingPage = async () => {
    const user = await currentUser()
    if (user) {
        return redirect('/mail')
    }
    return (
        <>
            <Header />
            
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-hidden">
                {/* Background decoration */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_80%)]"></div>
                
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="mb-8">
                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light text-gray-900 mb-6 leading-tight">
                            The minimalistic, <br />
                            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-medium">
                                AI-powered email client
                            </span>
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed mb-8">
                            Transform your email workflow with AI-driven RAG, lightning-fast search, and keyboard-first design. 
                            Built for power users who demand efficiency.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-light">
                                <Link href="/mail">Get Started</Link>
                            </Button>
                            <Link href='https://start-saas.com?utm=normalhuman'>
                                <Button variant="outline" size="lg" className="border-gray-300 text-gray-700 hover:border-blue-600 hover:text-blue-600 px-8 py-4 text-lg font-light">
                                    Learn More
                                </Button>
                            </Link>
                        </div>
                        
                        {/* Social proof */}
                        <div className="flex items-center justify-center space-x-8 text-gray-500">
                            <div className="flex items-center space-x-2">
                                <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                    ))}
                                </div>
                                <span className="font-light">4.9/5 from 2,000+ users</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-light text-gray-900 mb-4">
                            Experience the power of modern email
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light">
                            Three core features that revolutionize how you manage emails
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* AI RAG Feature */}
                        <div className="group p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 border border-blue-100">
                            <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                                <Brain className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-medium text-gray-900 mb-4">AI-driven email RAG</h3>
                            <p className="text-gray-600 font-light leading-relaxed text-lg mb-6">
                                Intelligent email retrieval and generation using advanced RAG technology. 
                                Get contextual insights and smart reply suggestions.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-center space-x-3 text-gray-600">
                                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                    <span className="font-light">Contextual understanding</span>
                                </li>
                                <li className="flex items-center space-x-3 text-gray-600">
                                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                    <span className="font-light">Smart reply suggestions</span>
                                </li>
                                <li className="flex items-center space-x-3 text-gray-600">
                                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                    <span className="font-light">Email summarization</span>
                                </li>
                            </ul>
                        </div>

                        {/* Search Feature */}
                        <div className="group p-8 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 transition-all duration-300 border border-emerald-100">
                            <div className="w-16 h-16 bg-emerald-600 rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                                <Search className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-medium text-gray-900 mb-4">Full-text search</h3>
                            <p className="text-gray-600 font-light leading-relaxed text-lg mb-6">
                                Lightning-fast search across all your emails with semantic understanding. 
                                Find anything in milliseconds.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-center space-x-3 text-gray-600">
                                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                    <span className="font-light">Sub-second results</span>
                                </li>
                                <li className="flex items-center space-x-3 text-gray-600">
                                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                    <span className="font-light">Search attachments</span>
                                </li>
                                <li className="flex items-center space-x-3 text-gray-600">
                                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                    <span className="font-light">Fuzzy matching</span>
                                </li>
                            </ul>
                        </div>

                        {/* Shortcuts Feature */}
                        <div className="group p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-all duration-300 border border-purple-100">
                            <div className="w-16 h-16 bg-purple-600 rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                                <Keyboard className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-medium text-gray-900 mb-4">Shortcut-focused interface</h3>
                            <p className="text-gray-600 font-light leading-relaxed text-lg mb-6">
                                Keyboard-first interface designed for power users. 
                                Navigate and manage emails without touching the mouse.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-center space-x-3 text-gray-600">
                                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                    <span className="font-light">⌘K Quick Search</span>
                                </li>
                                <li className="flex items-center space-x-3 text-gray-600">
                                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                    <span className="font-light">⌘R Quick Reply</span>
                                </li>
                                <li className="flex items-center space-x-3 text-gray-600">
                                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                    <span className="font-light">⌘J Jump to Inbox</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Demo Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50">
                <div className="max-w-6xl mx-auto text-center">
                    <h2 className="text-3xl sm:text-4xl font-light text-gray-900 mb-4">
                        See it in action
                    </h2>
                    <p className="text-xl text-gray-600 mb-12 font-light">
                        Experience the clean, intuitive interface designed for productivity
                    </p>
                    <div className="relative">
                        <div className="w-full max-w-4xl mx-auto h-96 bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl shadow-2xl flex items-center justify-center overflow-hidden">
                            <div className="text-center">
                                <Zap className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                                <p className="text-gray-500 text-lg font-light">Interactive Demo Coming Soon</p>
                                <p className="text-gray-400 text-sm mt-2">Experience the full interface</p>
                            </div>
                        </div>
                        {/* Decorative elements */}
                        <div className="absolute -top-4 -left-4 w-8 h-8 bg-blue-600 rounded-full opacity-20"></div>
                        <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-indigo-600 rounded-full opacity-20"></div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-600">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl sm:text-4xl font-light text-white mb-6">
                        Ready to transform your email workflow?
                    </h2>
                    <p className="text-xl text-blue-100 mb-8 font-light">
                        Join thousands of power users who have revolutionized their email productivity
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-light">
                            <Link href="/mail">Start Free Trial</Link>
                        </Button>
                        <Link href="/sign-up">
                            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-light">
                                Sign Up Now
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center space-x-2 mb-4">
                                <Mail className="w-6 h-6 text-blue-400" />
                                <span className="text-lg font-medium text-white">EmailSaaS</span>
                            </div>
                            <p className="text-gray-400 font-light">
                                AI-powered email management platform for modern teams.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-medium text-white mb-4">Product</h3>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-gray-400 hover:text-blue-400 font-light">Features</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-blue-400 font-light">Pricing</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-blue-400 font-light">Documentation</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-medium text-white mb-4">Company</h3>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-gray-400 hover:text-blue-400 font-light">About</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-blue-400 font-light">Blog</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-blue-400 font-light">Careers</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-medium text-white mb-4">Support</h3>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-gray-400 hover:text-blue-400 font-light">Help Center</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-blue-400 font-light">Community</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-blue-400 font-light">Contact</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-8 text-center">
                        <p className="text-gray-400 font-light">
                            © 2024 EmailSaaS. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </>
    )
}

export default LandingPage