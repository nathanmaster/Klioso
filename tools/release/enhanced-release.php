#!/usr/bin/env php
<?php

/**
 * Enhanced Klioso Release Manager v2.0
 * 
 * Streamlined release management with proper version-specific documentation
 * and automated changelog generation that prevents stale content issues.
 * 
 * Usage:
 *   php enhanced-release.php 0.9.47 "Bug fixes and dashboard improvements"
 *   php enhanced-release.php 0.10.0 "Major architecture overhaul" --major
 *   php enhanced-release.php 1.0.0 "Production ready release" --stable
 */

class EnhancedReleaseManager
{
    private $projectRoot;
    private $version;
    private $description;
    private $releaseType;
    private $config;

    public function __construct()
    {
        $this->projectRoot = dirname(__DIR__, 2); // Go up from tools/release/ to project root
        $this->config = $this->loadConfig();
    }

    public function main($argv)
    {
        if (count($argv) < 3) {
            $this->showUsage();
            return;
        }

        $this->version = $argv[1];
        $this->description = $argv[2];
        $this->releaseType = $this->determineReleaseType($argv);

        $this->validateInputs();
        $this->createRelease();
    }

    private function showUsage()
    {
        echo "🚀 Enhanced Klioso Release Manager v2.0\n\n";
        echo "Usage:\n";
        echo "  php enhanced-release.php VERSION \"DESCRIPTION\" [--type]\n\n";
        echo "Examples:\n";
        echo "  php enhanced-release.php 0.9.47 \"Bug fixes and improvements\"\n";
        echo "  php enhanced-release.php 0.10.0 \"Major architecture update\" --major\n";
        echo "  php enhanced-release.php 1.0.0 \"Production ready\" --stable\n\n";
        echo "Flags:\n";
        echo "  --major    Major release with breaking changes\n";
        echo "  --minor    Minor release with new features (default)\n";
        echo "  --patch    Patch release with bug fixes only\n";
        echo "  --stable   Stable production release\n";
        echo "  --beta     Beta pre-release\n";
        echo "  --dry-run  Preview changes without executing\n\n";
    }

    private function loadConfig()
    {
        $configPath = __DIR__ . '/config.json';
        if (file_exists($configPath)) {
            return json_decode(file_get_contents($configPath), true);
        }
        
        // Default configuration
        return [
            'project_name' => 'Klioso',
            'repository' => 'nathanmaster/Klioso',
            'auto_git' => true,
            'create_tag' => true,
            'update_changelog' => true
        ];
    }

    private function determineReleaseType($argv)
    {
        if (in_array('--major', $argv)) return 'major';
        if (in_array('--patch', $argv)) return 'patch';
        if (in_array('--beta', $argv)) return 'beta';
        if (in_array('--stable', $argv)) return 'stable';
        return 'minor'; // default
    }

    private function validateInputs()
    {
        // Validate version format
        if (!preg_match('/^\d+\.\d+\.\d+(-[a-z0-9]+(\.\d+)?)?$/', $this->version)) {
            echo "❌ Invalid version format. Use semantic versioning (X.Y.Z)\n";
            exit(1);
        }

        // Validate description
        if (empty(trim($this->description))) {
            echo "❌ Release description cannot be empty\n";
            exit(1);
        }

        // Check if we're in a git repository
        if (!is_dir($this->projectRoot . '/.git')) {
            echo "❌ Not in a git repository\n";
            exit(1);
        }

        echo "✅ Inputs validated successfully\n";
    }

    private function createRelease()
    {
        echo "🚀 Creating release v{$this->version}...\n";
        echo "📝 Description: {$this->description}\n";
        echo "🏷️ Type: {$this->releaseType}\n\n";

        // Step 1: Update version files
        $this->updateVersionFiles();

        // Step 2: Generate fresh release documentation
        $this->generateReleaseDocumentation();

        // Step 3: Update main changelog
        $this->updateMainChangelog();

        // Step 4: Commit changes and create tag
        if ($this->config['auto_git']) {
            $this->createGitCommitAndTag();
        }

        // Step 5: Display summary and next steps
        $this->showCompletionSummary();
    }

    private function updateVersionFiles()
    {
        echo "📝 Updating version files...\n";

        // Update version.json with comprehensive metadata
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

        // Update composer.json if it has a version field
        $composerPath = $this->projectRoot . '/composer.json';
        if (file_exists($composerPath)) {
            $composerData = json_decode(file_get_contents($composerPath), true);
            if (isset($composerData['version'])) {
                $composerData['version'] = $this->version;
                file_put_contents(
                    $composerPath,
                    json_encode($composerData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n"
                );
            }
        }

        echo "  ✅ Version files updated\n";
    }

    private function generateReleaseDocumentation()
    {
        echo "📖 Generating release documentation...\n";

        $releaseDir = $this->projectRoot . '/docs/releases/v' . $this->getMajorMinor();
        if (!is_dir($releaseDir)) {
            mkdir($releaseDir, 0755, true);
        }

        // Generate version-specific release notes
        $releaseNotesPath = $releaseDir . '/RELEASE_NOTES_v' . $this->version . '.md';
        $releaseNotes = $this->generateReleaseNotes();
        file_put_contents($releaseNotesPath, $releaseNotes);

        // Generate version-specific changelog
        $changelogPath = $releaseDir . '/CHANGELOG_v' . $this->version . '.md';
        $changelog = $this->generateVersionChangelog();
        file_put_contents($changelogPath, $changelog);

        echo "  ✅ Release documentation created:\n";
        echo "    📄 {$releaseNotesPath}\n";
        echo "    📄 {$changelogPath}\n";
    }

    private function generateReleaseNotes()
    {
        $templatePath = $this->projectRoot . '/docs/releases/templates/RELEASE_NOTES_TEMPLATE.md';
        if (!file_exists($templatePath)) {
            return $this->generateBasicReleaseNotes();
        }

        $template = file_get_contents($templatePath);
        return $this->processTemplate($template);
    }

    private function generateBasicReleaseNotes()
    {
        $codename = $this->generateCodename();
        return "# Klioso v{$this->version} - {$codename}

**Release Date**: " . date('F j, Y') . "  
**Version**: {$this->version}  
**Type**: " . ucfirst($this->releaseType) . " Release  
**Stability**: " . (in_array($this->releaseType, ['stable', 'major']) ? 'Stable' : 'Development') . "

---

## 🎯 **Release Overview**

{$this->description}

## 🚀 **Key Features**

- [Add key features here]

## 🐛 **Bug Fixes**

- [Add bug fixes here]

## 🔧 **Technical Improvements**

- [Add technical improvements here]

## 📋 **Installation & Upgrade**

### **New Installation**
```bash
# Download the latest release
wget https://github.com/{$this->config['repository']}/releases/download/v{$this->version}/klioso-v{$this->version}.zip

# Extract and install
unzip klioso-v{$this->version}.zip
cd klioso-v{$this->version}
```

### **Upgrade from Previous Version**
```bash
# Backup your current installation
cp -r /path/to/klioso /path/to/klioso-backup

# Download and extract new version
wget https://github.com/{$this->config['repository']}/releases/download/v{$this->version}/klioso-v{$this->version}.zip
unzip klioso-v{$this->version}.zip

# Run migration (if needed)
php artisan migrate
```

---

**Full Changelog**: [View on GitHub](https://github.com/{$this->config['repository']}/compare/v{$this->getPreviousVersion()}...v{$this->version})  
**Download**: [GitHub Releases](https://github.com/{$this->config['repository']}/releases/tag/v{$this->version})

*Generated on " . date('Y-m-d H:i:s T') . "*
";
    }

    private function generateVersionChangelog()
    {
        return "# Changelog - v{$this->version}

## [v{$this->version}] - " . date('Y-m-d') . "

### Summary
{$this->description}

### Added
- [List new features here]

### Changed
- [List changes to existing features here]

### Fixed
- [List bug fixes here]

### Deprecated
- [List deprecated features here]

### Removed
- [List removed features here]

### Security
- [List security improvements here]

---

**Release Type**: " . ucfirst($this->releaseType) . "  
**Git Tag**: v{$this->version}  
**Release Date**: " . date('F j, Y') . "
";
    }

    private function updateMainChangelog()
    {
        echo "📝 Updating main changelog...\n";

        $changelogPath = $this->projectRoot . '/CHANGELOG.md';
        $newEntry = $this->generateMainChangelogEntry();

        if (file_exists($changelogPath)) {
            $currentContent = file_get_contents($changelogPath);
            
            // Insert new entry after the header
            if (preg_match('/^(# .+?\n+)(.*)$/s', $currentContent, $matches)) {
                $header = $matches[1];
                $existingContent = $matches[2];
                $newContent = $header . $newEntry . "\n" . $existingContent;
            } else {
                $newContent = $newEntry . "\n" . $currentContent;
            }
        } else {
            $newContent = "# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n" . $newEntry;
        }

        file_put_contents($changelogPath, $newContent);
        echo "  ✅ Main changelog updated\n";
    }

    private function generateMainChangelogEntry()
    {
        $compareUrl = "https://github.com/{$this->config['repository']}/compare/v{$this->getPreviousVersion()}...v{$this->version}";
        
        return "## [v{$this->version}] - " . date('Y-m-d') . " - " . $this->generateCodename() . "

### Overview
{$this->description}

**Type**: " . ucfirst($this->releaseType) . " Release  
**Stability**: " . (in_array($this->releaseType, ['stable', 'major']) ? 'Stable' : 'Development') . "

### Key Changes
- [List major changes here]

**Full Changelog**: [{$compareUrl}]({$compareUrl})  
**Release Notes**: [docs/releases/v{$this->getMajorMinor()}/RELEASE_NOTES_v{$this->version}.md](docs/releases/v{$this->getMajorMinor()}/RELEASE_NOTES_v{$this->version}.md)

---
";
    }

    private function createGitCommitAndTag()
    {
        echo "🔖 Creating git commit and tag...\n";

        // Add all changes
        $this->runCommand('git add .');

        // Create commit
        $commitMessage = "chore(release): prepare v{$this->version}\n\n{$this->description}\n\nType: {$this->releaseType}";
        $this->runCommand('git commit -m ' . escapeshellarg($commitMessage));

        // Create annotated tag
        $tagMessage = "v{$this->version} - " . $this->generateCodename() . "\n\n{$this->description}";
        $this->runCommand('git tag -a v' . $this->version . ' -m ' . escapeshellarg($tagMessage));

        echo "  ✅ Git commit and tag created\n";
        echo "  🏷️ Tag: v{$this->version}\n";
    }

    private function showCompletionSummary()
    {
        echo "\n" . str_repeat("=", 50) . "\n";
        echo "🎉 Release v{$this->version} created successfully!\n";
        echo str_repeat("=", 50) . "\n\n";

        echo "📋 **What was created:**\n";
        echo "  ✅ Updated version files (version.json, package.json)\n";
        echo "  ✅ Generated release notes: docs/releases/v{$this->getMajorMinor()}/RELEASE_NOTES_v{$this->version}.md\n";
        echo "  ✅ Generated changelog: docs/releases/v{$this->getMajorMinor()}/CHANGELOG_v{$this->version}.md\n";
        echo "  ✅ Updated main CHANGELOG.md\n";
        echo "  ✅ Created git commit and tag: v{$this->version}\n\n";

        echo "🚀 **Next Steps:**\n";
        echo "  1. Review generated documentation and make any necessary edits\n";
        echo "  2. Push changes and tags to remote:\n";
        echo "     git push origin main\n";
        echo "     git push origin v{$this->version}\n";
        echo "  3. GitHub Actions will automatically create the release\n";
        echo "  4. Publish release notes and notify the community\n\n";

        echo "🔗 **Quick Links:**\n";
        echo "  📄 Release Notes: docs/releases/v{$this->getMajorMinor()}/RELEASE_NOTES_v{$this->version}.md\n";
        echo "  📝 Changelog: docs/releases/v{$this->getMajorMinor()}/CHANGELOG_v{$this->version}.md\n";
        echo "  🏷️ Git Tag: v{$this->version}\n";
        echo "  🌐 Repository: https://github.com/{$this->config['repository']}\n\n";
    }

    private function processTemplate($template)
    {
        $versionData = json_decode(file_get_contents($this->projectRoot . '/version.json'), true);

        $replacements = [
            '{{version}}' => $this->version,
            '{{date}}' => date('F j, Y'),
            '{{year}}' => date('Y'),
            '{{codename}}' => $this->generateCodename(),
            '{{description}}' => $this->description,
            '{{type}}' => ucfirst($this->releaseType),
            '{{stability}}' => in_array($this->releaseType, ['stable', 'major']) ? 'Stable' : 'Development',
            '{{repository}}' => $this->config['repository']
        ];

        return str_replace(array_keys($replacements), array_values($replacements), $template);
    }

    private function generateCodename()
    {
        $codenames = [
            'major' => ['Phoenix', 'Evolution', 'Revolution', 'Quantum', 'Genesis'],
            'minor' => ['Swift', 'Pulse', 'Nexus', 'Vertex', 'Prism'],
            'patch' => ['Refine', 'Polish', 'Enhance', 'Improve', 'Optimize'],
            'stable' => ['Milestone', 'Foundation', 'Cornerstone', 'Flagship', 'Premier'],
            'beta' => ['Preview', 'Pioneer', 'Explorer', 'Frontier', 'Venture']
        ];

        $typeCodenames = $codenames[$this->releaseType] ?? $codenames['minor'];
        return $typeCodenames[array_rand($typeCodenames)];
    }

    private function getMajorMinor()
    {
        $parts = explode('.', $this->version);
        return $parts[0] . '.' . $parts[1];
    }

    private function getPreviousVersion()
    {
        // This is a simplified version - in practice you might want to 
        // parse git tags to find the actual previous version
        $parts = explode('.', $this->version);
        if ($parts[2] > 0) {
            $parts[2]--;
        } elseif ($parts[1] > 0) {
            $parts[1]--;
            $parts[2] = 0;
        } else {
            $parts[0]--;
            $parts[1] = 0;
            $parts[2] = 0;
        }
        return implode('.', $parts);
    }

    private function runCommand($command)
    {
        $output = [];
        $returnCode = 0;
        exec($command, $output, $returnCode);
        
        if ($returnCode !== 0) {
            echo "❌ Command failed: {$command}\n";
            echo "Output: " . implode("\n", $output) . "\n";
            exit(1);
        }
        
        return $output;
    }
}

// Run the script
$releaseManager = new EnhancedReleaseManager();
$releaseManager->main($argv);
