// src/pages/public/LoginPage.jsx

import GoogleLoginButton from '../../auth/GoogleLoginButton';

const LoginPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl w-full max-w-md shadow">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
          Login to ShopX
        </h1>

        {/* Google Login */}
        <div className="flex justify-center">
          <GoogleLoginButton />
        </div>

        {/* Future Email / OTP */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Email / OTP login coming soon
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
