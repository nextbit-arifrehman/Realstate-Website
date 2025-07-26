import { Link } from "react-router-dom";
import { Home, Facebook, Twitter, Instagram, Linkedin, Phone, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Home className="text-white text-xl" />
              </div>
              <div>
                <h3 className="font-inter font-bold text-xl">RealEstate Pro</h3>
                <p className="text-xs text-neutral-400">Your Dream Property</p>
              </div>
            </div>
            <p className="text-neutral-300 mb-6 max-w-md leading-relaxed">
              The most trusted real estate platform connecting buyers, sellers, and agents. Find your perfect property with confidence and security.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center hover:bg-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center hover:bg-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center hover:bg-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center hover:bg-primary transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-neutral-300 hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/properties" className="text-neutral-300 hover:text-white transition-colors">All Properties</Link></li>
              <li><a href="#" className="text-neutral-300 hover:text-white transition-colors">Buy Property</a></li>
              <li><a href="#" className="text-neutral-300 hover:text-white transition-colors">Sell Property</a></li>
              <li><a href="#" className="text-neutral-300 hover:text-white transition-colors">Find Agents</a></li>
              <li><a href="#" className="text-neutral-300 hover:text-white transition-colors">About Us</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Support</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-neutral-300 hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="text-neutral-300 hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="text-neutral-300 hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-neutral-300 hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-neutral-300 hover:text-white transition-colors">Cookie Policy</a></li>
              <li><a href="#" className="text-neutral-300 hover:text-white transition-colors">Become an Agent</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-neutral-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-neutral-400 text-sm">
            © 2024 RealEstate Pro. All rights reserved.
          </p>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <div className="flex items-center text-sm text-neutral-400">
              <Phone className="w-4 h-4 mr-2" />
              <span>1-800-REAL-PRO</span>
            </div>
            <div className="flex items-center text-sm text-neutral-400">
              <Mail className="w-4 h-4 mr-2" />
              <span>support@realestatepro.com</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
