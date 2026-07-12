const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const rateLimit = require('express-rate-limit');
const prisma = require('../prismaClient');
const { requireAuth } = require('../middleware/auth');

// JWT Secrets and settings
const JWT_SECRET = process.env.JWT_SECRET || 'cropmax_super_secret_key_18012005';
const JWT_EXPIRY = '7d';

// Rate limiter for Auth endpoints
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Limit to 5 attempts per minute to easily test rate limiting
  handler: (req, res) => {
    res.status(429).json({
      error: {
        status: 429,
        message: 'Too many authentication requests from this IP. Please try again after a minute.'
      }
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Zod schemas for input validation
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  role: z.string().optional().default('Farmer')
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

// 1. POST /api/auth/register - Register a new user
router.post('/register', authLimiter, async (req, res, next) => {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      const err = new Error(parseResult.error.errors[0].message);
      err.status = 400;
      return next(err);
    }

    const { name, email, password, role } = parseResult.data;

    // Check duplicate email
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      const err = new Error('An account with this email address already exists.');
      err.status = 400;
      return next(err);
    }

    // Hash password (10 salt rounds)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    next(error);
  }
});

// 2. POST /api/auth/login - Login a user
router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      const err = new Error(parseResult.error.errors[0].message);
      err.status = 400;
      return next(err);
    }

    const { email, password } = parseResult.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user || !user.password) {
      const err = new Error('Invalid email or password.');
      err.status = 400;
      return next(err);
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const err = new Error('Invalid email or password.');
      err.status = 400;
      return next(err);
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
});

// 3. GET /api/auth/me - Retrieve current logged-in user profile
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      const err = new Error('User not found');
      err.status = 404;
      return next(err);
    }

    // Count user's crops
    const cropCount = await prisma.crop.count({
      where: { userId: user.id }
    });

    res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        cropCount
      }
    });
  } catch (error) {
    next(error);
  }
});

// 4. OAuth Mock / Simulated Flow Routes
// Redirect to simulated consent screen
router.get('/google', (req, res) => {
  res.redirect('/api/auth/mock-consent?provider=Google');
});

router.get('/github', (req, res) => {
  res.redirect('/api/auth/mock-consent?provider=GitHub');
});

// Render simulated consent HTML page
router.get('/mock-consent', (req, res) => {
  const provider = req.query.provider || 'OAuth';
  const logoColor = provider === 'Google' ? 'text-red-500' : 'text-zinc-800 dark:text-white';
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Authorize CropMax AI via ${provider}</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <style>
        body {
          font-family: 'Outfit', sans-serif;
        }
      </style>
    </head>
    <body class="bg-zinc-50 dark:bg-zinc-950 min-h-screen flex items-center justify-center p-4">
      <div class="max-w-md w-full bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-8 shadow-xl space-y-6">
        <!-- Provider Info -->
        <div class="text-center space-y-3">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 font-bold text-2xl ${logoColor}">
            ${provider === 'Google' ? 'G' : '🐙'}
          </div>
          <h1 class="text-2xl font-bold text-zinc-900 dark:text-white">Sign in with ${provider}</h1>
          <p class="text-sm text-zinc-500 dark:text-zinc-400">
            Authorize <span class="font-semibold text-emerald-600">CropMax AI</span> to access your account details.
          </p>
        </div>

        <div class="border-t border-b border-zinc-100 dark:border-zinc-800 py-4 space-y-3">
          <p class="text-xs font-bold text-zinc-400 uppercase tracking-wider">Permissions Requested:</p>
          <div class="flex items-start space-x-3 text-sm text-zinc-600 dark:text-zinc-300">
            <span class="text-emerald-500">✔</span>
            <div>
              <p class="font-medium">Read profile information</p>
              <p class="text-xs text-zinc-400">Access to your full name and display photo.</p>
            </div>
          </div>
          <div class="flex items-start space-x-3 text-sm text-zinc-600 dark:text-zinc-300">
            <span class="text-emerald-500">✔</span>
            <div>
              <p class="font-medium">Read email address</p>
              <p class="text-xs text-zinc-400">Access to your primary email address for notifications.</p>
            </div>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-3 pt-2">
          <button 
            onclick="cancelAuth()" 
            class="flex-1 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium py-3 px-4 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button 
            onclick="approveAuth()" 
            class="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium py-3 px-4 rounded-xl shadow-md transition-all duration-200"
          >
            Authorize
          </button>
        </div>

        <div class="text-center text-xs text-zinc-400">
          Redirects to: <span class="font-mono text-zinc-500">http://localhost:3000/auth/callback</span>
        </div>
      </div>

      <script>
        function approveAuth() {
          const provider = "${provider}";
          window.location.href = \`/api/auth/mock-callback?provider=\${provider.toLowerCase()}\`;
        }
        function cancelAuth() {
          window.location.href = "http://localhost:3000/login?error=OAuthCancelled";
        }
      </script>
    </body>
    </html>
  `;
  res.send(html);
});

// OAuth Callback simulator
router.get('/mock-callback', async (req, res, next) => {
  try {
    const provider = req.query.provider || 'google';
    
    // Simulate obtaining user profiles from Google/GitHub
    const mockProfiles = {
      google: {
        id: 'google-oauth-10928374',
        name: 'John Google Farmer',
        email: 'john.google@cropmax.ai'
      },
      github: {
        id: 'github-oauth-29384710',
        name: 'Jane GitHub Farmer',
        email: 'jane.github@cropmax.ai'
      }
    };

    const profile = mockProfiles[provider] || mockProfiles.google;

    // Check if user exists by oauth provider/id
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: profile.email },
          { AND: [{ oauthProvider: provider }, { oauthId: profile.id }] }
        ]
      }
    });

    if (!user) {
      // Create user if not existing
      user = await prisma.user.create({
        data: {
          name: profile.name,
          email: profile.email,
          oauthProvider: provider,
          oauthId: profile.id,
          role: 'Farmer'
        }
      });
      console.log(`👤 Created new OAuth user via ${provider}: ${user.email}`);
    } else if (!user.oauthProvider) {
      // Link OAuth fields to existing credential user
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          oauthProvider: provider,
          oauthId: profile.id
        }
      });
      console.log(`🔗 Linked OAuth profile to existing user: ${user.email}`);
    }

    // Sign JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    // Redirect to frontend callback route with signed token
    res.redirect(`http://localhost:3000/auth/callback?token=${token}`);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
