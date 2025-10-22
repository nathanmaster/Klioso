# Klioso - GitHub Packages Installation

## 📦 Installation from GitHub Packages

### Method 1: Using .npmrc (Recommended)

Create a `.npmrc` file in your project or home directory:

```
@nathanmaster:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

Then install:
```bash
npm install @nathanmaster/klioso
```

### Method 2: Direct Installation

```bash
npm install @nathanmaster/klioso --registry=https://npm.pkg.github.com
```

### Method 3: Global Installation

```bash
npm config set @nathanmaster:registry https://npm.pkg.github.com
npm install -g @nathanmaster/klioso
```

## 🔑 Authentication

To install from GitHub Packages, you need a GitHub Personal Access Token with `read:packages` permission:

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Create a new token with `read:packages` scope
3. Use it in your `.npmrc` file or set as environment variable

## 🚀 Usage

After installation, run the installer:

```bash
# If installed globally
klioso

# If installed locally
npx @nathanmaster/klioso
```

## 📋 Alternative Registries

You can also install from:
- **npm registry**: `npm install klioso`
- **GitHub Packages**: `npm install @nathanmaster/klioso`

Both contain the same package with identical functionality.
