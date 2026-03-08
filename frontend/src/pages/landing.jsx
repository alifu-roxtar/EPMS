// App.js
import React, { useEffect, useState } from 'react';
import usersImage from "../Images/nn.png";
import countries from "../Images/countries.png";
import actives from "../Images/active.png";

import user1 from "../Images/user1.jpg";
import user2 from "../Images/user2.jpg";
import user3 from "../Images/user3.jpg";

import { 
  FaUsers, FaClock, FaMoneyBillWave, FaShieldAlt, 
  FaChartLine, FaCloud, FaMobile, FaHeadset,
  FaArrowRight, FaCheckCircle, FaPlay, FaStar,
  FaFacebook, FaTwitter, FaGithub, FaInstagram,
  FaBars, FaTimes, FaCalculator, FaFileInvoice,
  FaUserCheck, FaRocket,
  FaFileExport, FaGlobe
} from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fadeInUp');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      observer.observe(el);
    });

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-500 ${
        scrolled ? 'bg-white shadow-lg py-2' : 'bg-transparent py-4'
      }`}>
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FaRocket className={`text-3xl transition-colors duration-500 ${
                scrolled ? 'text-blue-600' : 'text-white'
              }`} />
              <span className={`text-2xl font-bold transition-colors duration-500 ${
                scrolled ? 'text-gray-800' : 'text-white'
              }`}>
                PayFlow<span className="text-black/60">EPMS</span>
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              {['Home', 'About', 'How It Works', 'Features', 'Contact'].map((item) => (
                <Link
                  key={item}
                  to={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                  className={`font-medium hover:text-yellow-300 transition-colors duration-300 ${
                    scrolled ? 'text-gray-700' : 'text-white'
                  }`}
                >
                  {item}
                </Link>
              ))}
              <Link to={`/register`} className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-2xl"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <FaTimes className={scrolled ? 'text-gray-800' : 'text-white'} />
              ) : (
                <FaBars className={scrolled ? 'text-gray-800' : 'text-white'} />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          <div className={`md:hidden transition-all duration-500 overflow-hidden ${
            isMenuOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
          }`}>
            <div className="bg-white rounded-2xl shadow-xl p-4">
              {['Home', 'About', 'How It Works', 'Features', 'Contact'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                  className="block py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 rounded-lg transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
              <Link to='/register' className="w-full mt-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-300">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
          <div className="absolute inset-0 opacity-30">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white animate-float"
                style={{
                  width: `${Math.random() * 300 + 50}px`,
                  height: `${Math.random() * 300 + 50}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${Math.random() * 10 + 10}s`,
                }}
              />
            ))}
          </div>
        </div>

        <div className="relative container mx-auto px-6 text-center text-white">
          <div className="animate-on-scroll">
            <h1 className="text-3xl md:text-7xl font-bold mb-6 mt-8 leading-tight">
              Simplify Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">
                Payroll Management
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto opacity-90">
              Streamline your employee payments with our intelligent EPMS solution. 
              Save time, reduce errors, and ensure compliance with automated payroll processing.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Link to={`/register`} className="group bg-white text-blue-600 px-8 py-4 rounded-full font-semibold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center">
                Start Free Trial
                <FaArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" />
              </Link>
              <Link to={`/register`} className="group border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-blue-600 transform hover:scale-105 transition-all duration-300 flex items-center justify-center">
                Get Started
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
            {[
              { number: '10K+', image: usersImage, label: 'Active Users', icon: FaUsers },
              { number: '50+', image: countries, label: 'Countries', icon: FaGlobe },
              { number: '99.9%', image: actives, label: 'Uptime', icon: FaCloud }
            ].map((stat, index) => (
              <div key={index} className="animate-on-scroll bg-white/10 backdrop-blur-lg rounded-2xl p-6 hover:bg-white/20 transition-all duration-500">
                <stat.icon className="text-4xl mx-auto mb-3 text-yellow-300" />
                <img src={stat.image} alt="Users" className='rounded'/>
                <div className="text-3xl font-bold">{stat.number}</div>
                <div className="text-sm opacity-80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              About <span className="text-blue-600">PayFlow</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Revolutionizing payroll management with cutting-edge technology and intuitive design
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-on-scroll">
              <img 
                src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                alt="About EPMS"
                className="rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-700"
              />
            </div>
            <div className="space-y-6 animate-on-scroll">
              <h3 className="text-3xl font-bold text-gray-800">
                We're transforming how businesses handle payroll
              </h3>
              <p className="text-gray-600 text-lg">
                Founded in 2020, PayFlow has helped thousands of businesses streamline their payroll processes. 
                Our mission is to make payroll management simple, accurate, and stress-free for companies of all sizes.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  'Automated Calculations',
                  'Tax Compliance',
                  'Direct Deposit',
                  'Employee Self-Service',
                  'Time Tracking',
                  'Benefits Administration'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <FaCheckCircle className="text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              How It <span className="text-blue-600">Works</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Three simple steps to transform your payroll process
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: FaUserCheck,
                title: '1. Set Up Employees',
                description: 'Easily add employee information, tax details, and payment preferences in minutes.',
                color: 'from-blue-400 to-blue-600'
              },
              {
                icon: FaCalculator,
                title: '2. Run Payroll',
                description: 'Our system automatically calculates wages, deductions, and taxes with 100% accuracy.',
                color: 'from-purple-400 to-purple-600'
              },
              {
                icon: FaFileInvoice,
                title: '3. Process Payments',
                description: 'Approve and process payments instantly with direct deposit or paper checks.',
                color: 'from-pink-400 to-pink-600'
              }
            ].map((step, index) => (
              <div key={index} className="animate-on-scroll group">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${step.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                    <step.icon className="text-4xl text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-800">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Powerful <span className="text-blue-600">Features</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to manage payroll efficiently
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: FaUsers, title: 'Employee Management', desc: 'Centralized database for all employee information' },
              { icon: FaClock, title: 'Time Tracking', desc: 'Integrated time and attendance tracking system' },
              { icon: FaMoneyBillWave, title: 'Automated Payroll', desc: 'Calculate and process payroll with one click' },
              { icon: FaShieldAlt, title: 'Secure & Compliant', desc: 'Bank-level security and tax compliance' },
              { icon: FaChartLine, title: 'Analytics & Reports', desc: 'Detailed insights into payroll expenses' },
              { icon: FaCloud, title: 'Cloud-Based', desc: 'Access from anywhere, anytime' },
              { icon: FaMobile, title: 'Mobile App', desc: 'Manage payroll on the go' },
              { icon: FaHeadset, title: '24/7 Support', desc: 'Expert support whenever you need it' },
              { icon: FaFileExport, title: 'Report Generation', desc: 'The system help get reports of payments made over period of time' }
            ].map((feature, index) => (
              <div key={index} className="animate-on-scroll group">
                <div className="bg-gray-50 rounded-xl p-6 hover:bg-blue-50 transition-all duration-500 border border-transparent hover:border-blue-200">
                  <div className="bg-blue-600 w-14 h-14 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                    <feature.icon className="text-2xl text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-800">{feature.title}</h3>
                  <p className="text-gray-600">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-600">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              What Our <span className="text-yellow-300">Clients Say</span>
            </h2>
            <p className="text-xl text-white opacity-90 max-w-3xl mx-auto">
              Join thousands of satisfied businesses using PayFlow
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Johnson',
                profile: user1,
                role: 'HR Director, TechCorp',
                content: 'PayFlow has reduced our payroll processing time by 75%. The automation is incredible!',
                rating: 5
              },
              {
                name: 'Michael Chen',
                role: 'CEO, StartUp Inc',
                profile: user2,
                content: 'Finally a payroll system that actually saves time. The interface is intuitive and support is amazing.',
                rating: 5
              },
              {
                name: 'Emily Rodriguez',
                profile: user3,
                role: 'Finance Manager, Global Ltd',
                content: 'Compliance features alone are worth it. Never worry about tax calculations again.',
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="animate-on-scroll">
                <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                  <div className="flex text-yellow-400 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <FaStar key={i} />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 text-lg">{testimonial.content}</p>
                  <img src={testimonial.profile} alt="Profile Picture" className='h-70 w-60 rounded'/>
                  <div className="font-bold text-gray-800">{testimonial.name}</div>
                  <div className="text-gray-500 text-sm">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 shadow-2xl animate-on-scroll">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Ready to Transform Your Payroll?
            </h2>
            <p className="text-xl text-white opacity-90 mb-8">
              Join thousands of businesses that trust PayFlow for their payroll needs
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Link to={`/register`} className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                Start For Free Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <FaRocket className="text-3xl text-blue-400" />
                <span className="text-2xl font-bold">PayFlow<span className="text-blue-400">EPMS</span></span>
              </div>
              <p className="text-gray-400">
                Revolutionizing payroll management for modern businesses.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Docs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Connect With Us</h4>
              <div className="flex space-x-4">
                <Link to="https://web.facebook.com/profile.php?id=61562243137991&_rdc=1&_rdr#" className="bg-gray-800 p-3 rounded-full hover:bg-blue-600 transition-all duration-300">
                  <FaFacebook />
                </Link>
                <Link to="https://x.com/AlifuSheja09" className="bg-gray-800 p-3 rounded-full hover:bg-white hover:text-black transition-all duration-300">
                  <FaXTwitter />
                </Link>
                <Link to="http://github.com/alifu-roxtar/" className="bg-gray-800 p-3 rounded-full hover:bg-blue-700 transition-all duration-300">
                  <FaGithub />
                </Link>
                <Link to="https://www.instagram.com/alifu_roxtar_09/" className="bg-gray-800 p-3 rounded-full hover:bg-pink-600 transition-all duration-300">
                  <FaInstagram />
                </Link>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 PayFlow EPMS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
