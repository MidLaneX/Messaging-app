/**
 * Webpack optimization overrides
 * This extends Create React App's webpack config without ejecting
 */

const path = require('path');

module.exports = function override(config, env) {
  // Production optimizations
  if (env === 'production') {
    // Enable tree shaking for unused exports
    config.optimization.usedExports = true;
    
    // Optimize chunks
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        // Separate vendor bundle for better caching
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10,
        },
        // Separate AWS SDK into its own chunk (it's large)
        aws: {
          test: /[\\/]node_modules[\\/]@aws-sdk[\\/]/,
          name: 'aws-sdk',
          chunks: 'all',
          priority: 20,
        },
        // Common components
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          priority: 5,
          reuseExistingChunk: true,
        },
      },
    };

    // Add compression
    config.optimization.minimize = true;
    
    // Remove console logs in production
    if (config.optimization.minimizer) {
      config.optimization.minimizer.forEach((minimizer) => {
        if (minimizer.constructor.name === 'TerserPlugin') {
          minimizer.options.terserOptions.compress.drop_console = true;
        }
      });
    }
  }

  // Add bundle analyzer in development
  if (env === 'development') {
    const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
    if (process.env.ANALYZE) {
      config.plugins.push(new BundleAnalyzerPlugin());
    }
  }

  return config;
};