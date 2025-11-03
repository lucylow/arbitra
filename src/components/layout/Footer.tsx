import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">About Arbitra</h3>
            <p className="text-sm text-gray-600">
              Decentralized dispute resolution platform powered by blockchain technology.
            </p>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="#" className="hover:text-gray-900">Terms of Service</a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900">Privacy Policy</a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900">Arbitration Rules</a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Resources</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="#" className="hover:text-gray-900">Documentation</a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900">API Reference</a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900">Support</a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Email: support@arbitra.legal</li>
              <li>Twitter: @ArbitraLegal</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-center text-sm text-gray-500">
            © 2024 Arbitra. All rights reserved. Built on Internet Computer Protocol.
          </p>
        </div>
      </div>
    </footer>
  );
};

