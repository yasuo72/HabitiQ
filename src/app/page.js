'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  Heart, Brain, Activity, Sun, ChevronRight,
  Sparkles, Star, ChevronLeft, ArrowRight,
  Shield, Zap, LineChart, Users
} from 'lucide-react';

const features = [
  { 
    icon: Heart, 
    text: 'Track daily health metrics and habits',
    color: 'text-rose-500',
    bgColor: 'bg-rose-50',
    description: 'Monitor your vital signs, sleep patterns, and daily activities'
  },
  { 
    icon: Brain, 
    text: 'Get personalized AI health insights',
    color: 'text-violet-500',
    bgColor: 'bg-violet-50',
    description: 'Receive tailored recommendations based on your health data'
  },
  { 
    icon: Activity, 
    text: 'Monitor progress with detailed analytics',
    color: 'text-sky-500',
    bgColor: 'bg-sky-50',
    description: 'Visualize your health journey with comprehensive charts and trends'
  },
  { 
    icon: Sun, 
    text: 'Set and achieve meaningful health goals',
    color: 'text-amber-500',
    bgColor: 'bg-amber-50',
    description: 'Create customized goals with AI-powered achievement strategies'
  },
];

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Fitness Enthusiast',
    content: 'The AI recommendations have completely transformed my wellness routine. The personalized insights helped me achieve my fitness goals faster than ever!',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&h=100&q=80'
  },
  {
    name: 'Michael Chen',
    role: 'Health Coach',
    content: 'As a professional coach, I\'m impressed by the accuracy of the AI insights. It\'s like having a knowledgeable assistant that helps me provide better guidance to my clients.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&h=100&q=80'
  },
  {
    name: 'Emma Davis',
    role: 'Yoga Instructor',
    content: 'The personalized recommendations and tracking features are exactly what I needed. It\'s helped me maintain consistency in my practice and better understand my body.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&h=100&q=80'
  }
];

const benefits = [
  {
    icon: Shield,
    title: 'Privacy-First Approach',
    description: 'Your health data is encrypted and secure, giving you complete control over your information'
  },
  {
    icon: Zap,
    title: 'Real-Time Analysis',
    description: 'Get instant insights and recommendations as you log your daily health metrics'
  },
  {
    icon: LineChart,
    title: 'Progress Tracking',
    description: 'Visualize your health journey with beautiful charts and comprehensive analytics'
  },
  {
    icon: Users,
    title: 'Community Support',
    description: 'Connect with like-minded individuals and share your wellness journey'
  }
];

export default function Home() {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const router = useRouter();

  const handleStartJourney = async () => {
    if (username.trim()) {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-10 pb-20">
          <div className="absolute inset-0 bg-gradient-to-b from-violet-50/40" />
          <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-violet-50/40" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              {/* Left Column */}
              <div className="space-y-12">
                <div className="space-y-8">
                  <div className="inline-flex items-center space-x-2 px-4 py-2 bg-violet-50 rounded-full text-violet-600 text-sm font-medium border border-violet-100/50">
                    <Sparkles className="h-4 w-4" />
                    <span>AI-Powered Health Analytics</span>
                  </div>
                  
                  <div>
                    <h1 className="text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                      Your Personal
                      <span className="block text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">
                        AI Health Journal
                      </span>
                    </h1>
                    <p className="mt-6 text-xl text-gray-600 leading-relaxed">
                      Transform your wellness journey with AI-powered insights and personalized recommendations. Track, analyze, and improve your health with intelligent guidance.
                    </p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className="group relative p-6 bg-white rounded-2xl transition-all duration-300 hover:shadow-lg"
                    >
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gray-50 to-white -z-10" />
                      <div className="space-y-4">
                        <div className={`${feature.bgColor} ${feature.color} p-3 rounded-xl inline-flex group-hover:scale-110 transition-transform duration-300`}>
                          <feature.icon className="h-6 w-6" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-semibold text-gray-900">{feature.text}</h3>
                          <p className="text-sm text-gray-600">{feature.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column - Sign Up Form */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-100/20 to-indigo-100/20 rounded-3xl transform rotate-3 scale-105" />
                <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden">
                  <div className="p-8 space-y-6">
                    <div className="text-center space-y-2">
                      <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 shadow-lg mb-3">
                        <Brain className="h-7 w-7 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold">Start Your Journey</h2>
                      <p className="text-gray-600 text-sm">Join thousands improving their health with AI</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Choose a username
                        </label>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
                          placeholder="Enter your username"
                        />
                      </div>

                      <button
                        onClick={handleStartJourney}
                        disabled={isLoading}
                        className="group relative w-full py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-medium transition-all overflow-hidden hover:shadow-lg disabled:opacity-70"
                      >
                        <span className={`flex items-center justify-center ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                          Get Started
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                        {isLoading && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4">
                      {[
                        { label: 'Active Users', value: '10k+' },
                        { label: 'Satisfaction', value: '98%' },
                        { label: 'AI Support', value: '24/7' }
                      ].map((stat, index) => (
                        <div key={index} className="text-center">
                          <div className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">
                            {stat.value}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold">Why Choose Our Platform</h2>
              <p className="text-gray-600 mt-3">Experience the future of personal health management</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-violet-50 text-violet-600 mb-4">
                    <benefit.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-gray-600 text-sm">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold">Loved by Health Enthusiasts</h2>
              <p className="text-gray-600 mt-3">See what our users say about their experience</p>
            </div>

            <div className="relative max-w-3xl mx-auto">
              <div className="overflow-hidden">
                <div 
                  className="flex transition-transform duration-500 ease-out"
                  style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}
                >
                  {testimonials.map((testimonial, index) => (
                    <div
                      key={index}
                      className="w-full flex-shrink-0 px-4"
                      style={{ minWidth: '100%' }}
                    >
                      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center space-x-4 mb-6">
                          <Image
                            src={testimonial.avatar}
                            alt={testimonial.name}
                            width={48}
                            height={48}
                            className="rounded-full"
                          />
                          <div>
                            <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                            <p className="text-sm text-gray-600">{testimonial.role}</p>
                          </div>
                          <div className="flex ml-auto">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-600 italic">{testimonial.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center mt-8 space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      currentTestimonial === index ? 'bg-violet-600' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-violet-600 to-indigo-600">
          <div className="max-w-4xl mx-auto px-4 text-center text-white">
            <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Health Journey?</h2>
            <p className="text-lg text-violet-100 mb-8">
              Join thousands of users who are already experiencing the power of AI-driven health insights
            </p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center px-6 py-3 bg-white text-violet-600 rounded-xl font-medium hover:shadow-lg transition-shadow"
            >
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}