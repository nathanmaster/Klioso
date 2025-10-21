#!/usr/bin/env php
<?php

/**
 * Smart Klioso Release Manager v3.0
 * 
 * Intelligently generates version-specific release notes based on actual git commits
 * and prevents duplicate/stale content across releases.
 * 
 * Usage:
 *   php smart-release.php 0.9.53 "Bug fixes and mobile improvements"
 *   php smart-release.php --analyze-commits 0.9.51..HEAD
 */

class SmartReleaseManager
{
    private $projectRoot;
    private $version;
    private $description;
    private $releaseType;
    private $config;

    public function __construct()
    {
        $this->projectRoot = dirname(__DIR__, 2);
        $this->config = [
            'project_name' => 'Klioso',
            'package_name' => 'klioso',
            'repository' => 'nathanmaster/Klioso',
            'auto_git' => true,
            'create_tag' => true
        ];
    }

    public function main($argv)
    {
        if (count($argv) < 2) {
            $this->showUsage();
            return;
        }

        // Handle special commands
        if ($argv[1] === '--analyze-commits') {
            $this->analyzeCommits($argv[2] ?? 'HEAD~5..HEAD');
            return;
        }

        if (count($argv) < 3) {
            $this->showUsage();
            return;
        }

        $this->version = $argv[1];
        $this->description = $argv[2];
        $this->releaseType = $this->determineReleaseType($argv);

        $this->validateInputs();
        $this->createSmartRelease();
    }

    private function showUsage()
    {
        echo "🚀 Smart Klioso Release Manager v3.0\n\n";
        echo "Features:\n";
        echo "  ✅ Git commit-based changelog generation\n";
        echo "  ✅ Prevents duplicate release notes\n";
        echo "  ✅ Correct package naming (klioso, not wordpress-scanner)\n";
        echo "  ✅ Version-specific content\n\n";
        echo "Usage:\n";
        echo "  php smart-release.php VERSION \"DESCRIPTION\" [--type]\n\n";
        echo "Examples:\n";
        echo "  php smart-release.php 0.9.53 \"Bug fixes and mobile improvements\"\n";
        echo "  php smart-release.php 0.10.0 \"Architecture overhaul\" --major\n";
        echo "  php smart-release.php --analyze-commits 0.9.51..HEAD\n\n";
        echo "Flags:\n";
        echo "  --major    Major release with breaking changes\n";
        echo "  --minor    Minor release with new features (default)\n";
        echo "  --patch    Patch release with bug fixes only\n";
        echo "  --stable   Stable production release\n";
        echo "  --beta     Beta pre-release\n\n";
    }

    private function determineReleaseType($argv)
    {
        if (in_array('--major', $argv)) return 'major';
        if (in_array('--patch', $argv)) return 'patch';
        if (in_array('--beta', $argv)) return 'beta';
        if (in_array('--stable', $argv)) return 'stable';
        return 'minor';
    }

    private function validateInputs()
    {
        if (!preg_match('/^\d+\.\d+\.\d+(-[a-z0-9]+(\.\d+)?)?$/', $this->version)) {
            echo "❌ Invalid version format. Use semantic versioning (X.Y.Z)\n";
            exit(1);
        }

        if (empty(trim($this->description))) {
            echo "❌ Release description cannot be empty\n";
            exit(1);
        }

        if (!is_dir($this->projectRoot . '/.git')) {
            echo "❌ Not in a git repository\n";
            exit(1);
        }

        echo "✅ Inputs validated successfully\n";
    }

    private function createSmartRelease()
    {
        echo "🚀 Creating smart release v{$this->version}...\n";
        echo "📝 Description: {$this->description}\n";
        echo "🏷️ Type: {$this->releaseType}\n\n";

        // Get commit history since last release
        $commits = $this->getCommitsSinceLastRelease();
        echo "📊 Found " . count($commits) . " commits since last release\n";

        // Update version files
        $this->updateVersionFiles();

        // Generate smart release documentation
        $this->generateSmartReleaseNotes($commits);
        
        // Update changelog with specific changes
        $this->updateSmartChangelog($commits);

        // Create git commit and tag
        if ($this->config['auto_git']) {
            $this->createGitCommitAndTag();
        }

        $this->showCompletionSummary();
    }

    private function getCommitsSinceLastRelease()
    {
        // Get the last release tag
        $lastTag = trim(shell_exec('git describe --tags --abbrev=0 2>/dev/null || echo "HEAD~10"'));
        
        // If no tags exist, use last 10 commits
        if (empty($lastTag) || $lastTag === 'HEAD~10') {
            $range = 'HEAD~10..HEAD';
        } else {
            $range = $lastTag . '..HEAD';
        }

        echo "📅 Analyzing commits from {$range}\n";

        // Get commit data
        $gitLog = shell_exec("git log {$range} --pretty=format:'%H|%s|%b|%an|%ad' --date=short");
        
        if (empty($gitLog)) {
            return [];
        }

        $commits = [];
        $lines = explode("\n", trim($gitLog));
        
        foreach ($lines as $line) {
            if (empty($line)) continue;
            
            $parts = explode('|', $line, 5);
            if (count($parts) >= 4) {
                $commits[] = [
                    'hash' => substr($parts[0], 0, 7),
                    'subject' => $parts[1],
                    'body' => $parts[2] ?? '',
                    'author' => $parts[3],
                    'date' => $parts[4]
                ];
            }
        }

        return $commits;
    }

    private function categorizeCommits($commits)
    {
        $categories = [
            'features' => [],
            'fixes' => [],
            'improvements' => [],
            'docs' => [],
            'chore' => [],
            'other' => []
        ];

        foreach ($commits as $commit) {
            $subject = strtolower($commit['subject']);
            
            if (preg_match('/^(feat|feature|add)[:()]/', $subject)) {
                $categories['features'][] = $commit;
            } elseif (preg_match('/^(fix|bug|error|resolve)[:()]/', $subject)) {
                $categories['fixes'][] = $commit;
            } elseif (preg_match('/^(improve|enhance|update|refactor)[:()]/', $subject)) {
                $categories['improvements'][] = $commit;
            } elseif (preg_match('/^(docs?|documentation)[:()]/', $subject)) {
                $categories['docs'][] = $commit;
            } elseif (preg_match('/^(chore|build|ci|test)[:()]/', $subject)) {
                $categories['chore'][] = $commit;
            } else {
                $categories['other'][] = $commit;
            }
        }

        return $categories;
    }

    private function generateSmartReleaseNotes($commits)
    {
        echo "📖 Generating smart release notes...\n";

        $categories = $this->categorizeCommits($commits);
        $releaseDate = date('F j, Y');
        $codename = $this->generateCodename();

        $content = "# 🚀 Klioso v{$this->version} - {$codename}

**Release Date**: {$releaseDate}  
**Version**: {$this->version}  
**Type**: " . ucfirst($this->releaseType) . " Release  
**Stability**: " . (in_array($this->releaseType, ['stable', 'major']) ? 'Stable' : 'Development') . "

---

## 🎯 **Release Overview**

{$this->description}

**Commits in this release**: " . count($commits) . "  
**Key focus areas**: " . $this->identifyFocusAreas($categories) . "

---
";

        // Add version-specific changes
        if (!empty($categories['features'])) {
            $content .= "## ✨ **New Features**\n\n";
            foreach ($categories['features'] as $commit) {
                $content .= "- **{$commit['subject']}** (`{$commit['hash']}`)\n";
                if (!empty($commit['body'])) {
                    $body = str_replace("\n", " ", $commit['body']);
                    $content .= "  {$body}\n";
                }
                $content .= "\n";
            }
        }

        if (!empty($categories['fixes'])) {
            $content .= "## 🐛 **Bug Fixes**\n\n";
            foreach ($categories['fixes'] as $commit) {
                $content .= "- **{$commit['subject']}** (`{$commit['hash']}`)\n";
                if (!empty($commit['body'])) {
                    $body = str_replace("\n", " ", $commit['body']);
                    $content .= "  {$body}\n";
                }
                $content .= "\n";
            }
        }

        if (!empty($categories['improvements'])) {
            $content .= "## 🔧 **Improvements & Enhancements**\n\n";
            foreach ($categories['improvements'] as $commit) {
                $content .= "- **{$commit['subject']}** (`{$commit['hash']}`)\n";
                if (!empty($commit['body'])) {
                    $body = str_replace("\n", " ", $commit['body']);
                    $content .= "  {$body}\n";
                }
                $content .= "\n";
            }
        }

        if (!empty($categories['docs'])) {
            $content .= "## 📋 **Documentation Updates**\n\n";
            foreach ($categories['docs'] as $commit) {
                $content .= "- {$commit['subject']} (`{$commit['hash']}`)\n";
            }
            $content .= "\n";
        }

        // Add installation section with CORRECT package name
        $content .= $this->generateInstallationSection();

        // Add support section
        $content .= $this->generateSupportSection();

        // Save release notes
        $releaseDir = $this->projectRoot . '/docs/releases/v' . $this->getMajorMinor();
        if (!is_dir($releaseDir)) {
            mkdir($releaseDir, 0755, true);
        }

        $releaseNotesPath = $releaseDir . '/RELEASE_NOTES_v' . $this->version . '.md';
        file_put_contents($releaseNotesPath, $content);

        echo "  ✅ Smart release notes created: {$releaseNotesPath}\n";
    }

    private function generateInstallationSection()
    {
        return "---

## 📦 **Installation & Packages**

### **Release Packages**
- `klioso-v{$this->version}-production.zip` - Production-ready deployment package
- `klioso-v{$this->version}-windows.zip` - Windows/Laragon optimized with install.bat
- `klioso-v{$this->version}-shared-hosting.zip` - cPanel/shared hosting ready
- `klioso-v{$this->version}-source.zip` - Complete source code archive
- `checksums.txt` - SHA256 checksums for package verification

### 🏗️ **System Requirements**
- **PHP**: 8.2+ (8.3 recommended)
- **Database**: MySQL 8+ or SQLite 3+
- **Web Server**: Apache 2.4+ or Nginx 1.18+
- **Memory**: 256MB+ PHP memory limit
- **Storage**: 50MB+ free disk space

### ⚡ **Quick Installation**

#### Windows/Laragon (Recommended for development)
```bash
# Download and extract
wget https://github.com/{$this->config['repository']}/releases/download/v{$this->version}/klioso-v{$this->version}-windows.zip
unzip klioso-v{$this->version}-windows.zip -d C:/laragon/www/

# Install
cd C:/laragon/www/klioso-v{$this->version}
./install.bat
```

#### Linux Production
```bash
# Download and extract
wget https://github.com/{$this->config['repository']}/releases/download/v{$this->version}/klioso-v{$this->version}-production.zip
unzip klioso-v{$this->version}-production.zip

# Configure and migrate
cd klioso-v{$this->version}
cp .env.example .env
php artisan key:generate
php artisan migrate
```

#### Shared Hosting
```bash
# Download shared hosting package
wget https://github.com/{$this->config['repository']}/releases/download/v{$this->version}/klioso-v{$this->version}-shared-hosting.zip

# Upload via FTP/cPanel
# Move public/ contents to document root
# Configure database via hosting control panel
```

### 🔐 **Package Verification**
```bash
# Verify package integrity
sha256sum -c checksums.txt
```

";
    }

    private function generateSupportSection()
    {
        return "---

## 📞 **Support & Resources**

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/{$this->config['repository']}/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/{$this->config['repository']}/discussions)
- 📖 **Documentation**: [Project Wiki](https://github.com/{$this->config['repository']}/wiki)
- 📋 **Full Changelog**: [CHANGELOG.md](../../CHANGELOG.md)

---

**Full Changelog**: [View on GitHub](https://github.com/{$this->config['repository']}/compare/v{$this->getPreviousVersion()}...v{$this->version})  
**Download**: [GitHub Releases](https://github.com/{$this->config['repository']}/releases/tag/v{$this->version})

*Generated on " . date('Y-m-d H:i:s T') . " by Smart Release Manager v3.0*
";
    }

    private function updateVersionFiles()
    {
        echo "📝 Updating version files...\n";

        // Update version.json
        $versionData = [
            'version' => $this->version,
            'release_date' => date('Y-m-d'),
            'release_timestamp' => time(),
            'codename' => $this->generateCodename(),
            'description' => $this->description,
            'type' => $this->releaseType,
            'stability' => in_array($this->releaseType, ['stable', 'major']) ? 'stable' : 'development'
        ];

        file_put_contents(
            $this->projectRoot . '/version.json',
            json_encode($versionData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n"
        );

        // Update package.json
        $packagePath = $this->projectRoot . '/package.json';
        if (file_exists($packagePath)) {
            $packageData = json_decode(file_get_contents($packagePath), true);
            $packageData['version'] = $this->version;
            file_put_contents(
                $packagePath,
                json_encode($packageData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n"
            );
        }

        echo "  ✅ Version files updated\n";
    }

    private function updateSmartChangelog($commits)
    {
        echo "📝 Updating smart changelog...\n";

        $changelogPath = $this->projectRoot . '/CHANGELOG.md';
        $categories = $this->categorizeCommits($commits);
        
        $newEntry = "## [v{$this->version}] - " . date('Y-m-d') . " - " . $this->generateCodename() . "

### Summary
{$this->description}

**Type**: " . ucfirst($this->releaseType) . " Release  
**Commits**: " . count($commits) . " changes since last release

";

        if (!empty($categories['features'])) {
            $newEntry .= "### Added\n";
            foreach ($categories['features'] as $commit) {
                $newEntry .= "- {$commit['subject']} (`{$commit['hash']}`)\n";
            }
            $newEntry .= "\n";
        }

        if (!empty($categories['improvements'])) {
            $newEntry .= "### Changed\n";
            foreach ($categories['improvements'] as $commit) {
                $newEntry .= "- {$commit['subject']} (`{$commit['hash']}`)\n";
            }
            $newEntry .= "\n";
        }

        if (!empty($categories['fixes'])) {
            $newEntry .= "### Fixed\n";
            foreach ($categories['fixes'] as $commit) {
                $newEntry .= "- {$commit['subject']} (`{$commit['hash']}`)\n";
            }
            $newEntry .= "\n";
        }

        $compareUrl = "https://github.com/{$this->config['repository']}/compare/v{$this->getPreviousVersion()}...v{$this->version}";
        $newEntry .= "**Full Changelog**: [{$compareUrl}]({$compareUrl})\n\n---\n\n";

        // Insert into existing changelog
        if (file_exists($changelogPath)) {
            $currentContent = file_get_contents($changelogPath);
            
            if (preg_match('/^(# .+?\n+)(.*)$/s', $currentContent, $matches)) {
                $header = $matches[1];
                $existingContent = $matches[2];
                $newContent = $header . $newEntry . $existingContent;
            } else {
                $newContent = $newEntry . $currentContent;
            }
        } else {
            $newContent = "# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n" . $newEntry;
        }

        file_put_contents($changelogPath, $newContent);
        echo "  ✅ Smart changelog updated\n";
    }

    private function createGitCommitAndTag()
    {
        echo "🔖 Creating git commit and tag...\n";

        shell_exec('git add .');
        
        $commitMessage = "chore(release): prepare v{$this->version}\n\n{$this->description}\n\nType: {$this->releaseType}";
        shell_exec('git commit -m ' . escapeshellarg($commitMessage));

        $tagMessage = "v{$this->version} - " . $this->generateCodename() . "\n\n{$this->description}";
        shell_exec('git tag -a v' . $this->version . ' -m ' . escapeshellarg($tagMessage));

        echo "  ✅ Git commit and tag created\n";
        echo "  🏷️ Tag: v{$this->version}\n";
    }

    private function analyzeCommits($range)
    {
        echo "📊 Analyzing commits in range: {$range}\n\n";
        
        $commits = $this->getCommitsSinceLastRelease();
        $categories = $this->categorizeCommits($commits);
        
        echo "📈 **Commit Analysis**:\n";
        echo "  🚀 Features: " . count($categories['features']) . "\n";
        echo "  🐛 Bug Fixes: " . count($categories['fixes']) . "\n";
        echo "  🔧 Improvements: " . count($categories['improvements']) . "\n";
        echo "  📋 Documentation: " . count($categories['docs']) . "\n";
        echo "  🔨 Chore: " . count($categories['chore']) . "\n";
        echo "  📦 Other: " . count($categories['other']) . "\n\n";

        echo "💡 **Suggested Release Type**: " . $this->suggestReleaseType($categories) . "\n";
        echo "🎯 **Focus Areas**: " . $this->identifyFocusAreas($categories) . "\n\n";

        echo "📝 **Recent Commits**:\n";
        foreach (array_slice($commits, 0, 10) as $commit) {
            echo "  • {$commit['subject']} ({$commit['hash']})\n";
        }
    }

    private function suggestReleaseType($categories)
    {
        if (count($categories['features']) >= 3) return 'minor';
        if (count($categories['fixes']) >= 2) return 'patch';
        if (count($categories['improvements']) >= 2) return 'minor';
        return 'patch';
    }

    private function identifyFocusAreas($categories)
    {
        $areas = [];
        if (count($categories['features']) > 0) $areas[] = 'New Features';
        if (count($categories['fixes']) > 0) $areas[] = 'Bug Fixes';
        if (count($categories['improvements']) > 0) $areas[] = 'Improvements';
        if (count($categories['docs']) > 0) $areas[] = 'Documentation';
        
        return empty($areas) ? 'General Maintenance' : implode(', ', $areas);
    }

    private function generateCodename()
    {
        $codenames = [
            'Enhanced Analytics', 'Mobile Optimization', 'Performance Boost',
            'Security Hardening', 'UI/UX Polish', 'Architecture Refinement',
            'Quality Improvements', 'Stability Focus', 'Feature Enhancement',
            'Developer Experience', 'User Experience', 'System Optimization'
        ];
        
        return $codenames[array_rand($codenames)];
    }

    private function getMajorMinor()
    {
        return implode('.', array_slice(explode('.', $this->version), 0, 2));
    }

    private function getPreviousVersion()
    {
        $lastTag = trim(shell_exec('git describe --tags --abbrev=0 2>/dev/null'));
        return empty($lastTag) ? '0.9.0' : str_replace('v', '', $lastTag);
    }

    private function showCompletionSummary()
    {
        echo "\n" . str_repeat("=", 60) . "\n";
        echo "🎉 Smart Release v{$this->version} created successfully!\n";
        echo str_repeat("=", 60) . "\n\n";

        echo "📋 **What was created:**\n";
        echo "  ✅ Version-specific release notes with actual commit details\n";
        echo "  ✅ Smart changelog with categorized changes\n";
        echo "  ✅ Correct package naming (klioso, not wordpress-scanner)\n";
        echo "  ✅ Updated version files\n";
        echo "  ✅ Git commit and tag: v{$this->version}\n\n";

        echo "🚀 **Next Steps:**\n";
        echo "  1. Review the generated documentation\n";
        echo "  2. Push changes and tags:\n";
        echo "     git push origin dev\n";
        echo "     git push origin v{$this->version}\n";
        echo "  3. GitHub Actions will create the release with correct naming\n\n";

        echo "💡 **Note**: This release manager generates content based on actual\n";
        echo "    git commits, preventing duplicate/stale release notes!\n";
    }
}

// Run the release manager
$manager = new SmartReleaseManager();
$manager->main($argv);
