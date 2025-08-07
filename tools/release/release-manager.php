#!/usr/bin/env php
<?php

/**
 * Klioso Release Management Tool
 * 
 * A comprehensive tool for managing releases, generating documentation,
 * and maintaining version consistency across the project.
 * 
 * Usage:
 *   php release-manager.php create-release 0.9.47
 *   php release-manager.php generate-docs 0.9.47
 *   php release-manager.php prepare-build 0.9.47
 *   php release-manager.php cleanup-old
 */

class ReleaseManager
{
    private $projectRoot;
    private $version;
    private $config;

    public function __construct()
    {
        $this->projectRoot = dirname(__DIR__);
        $this->config = $this->loadConfig();
    }

    public function main($argv)
    {
        if (count($argv) < 2) {
            $this->showUsage();
            return;
        }

        $command = $argv[1];
        $this->version = $argv[2] ?? null;

        switch ($command) {
            case 'create-release':
                $this->createRelease();
                break;
            case 'generate-docs':
                $this->generateDocs();
                break;
            case 'prepare-build':
                $this->prepareBuild();
                break;
            case 'cleanup-old':
                $this->cleanupOldFiles();
                break;
            case 'validate':
                $this->validateRelease();
                break;
            case 'status':
                $this->showStatus();
                break;
            default:
                echo "❌ Unknown command: {$command}\n";
                $this->showUsage();
        }
    }

    private function createRelease()
    {
        if (!$this->version) {
            echo "❌ Version required for create-release command\n";
            return;
        }

        echo "🚀 Creating release v{$this->version}...\n";

        // 1. Validate version format
        if (!preg_match('/^\d+\.\d+\.\d+(-[a-z]+\.\d+)?$/', $this->version)) {
            echo "❌ Invalid version format. Use: X.Y.Z or X.Y.Z-type.N\n";
            return;
        }

        // 2. Update version in key files
        $this->updateVersionFiles();

        // 3. Create release documentation
        $this->createReleaseDocumentation();

        // 4. Generate changelog entry
        $this->generateChangelogEntry();

        // 5. Create git tag
        $this->createGitTag();

        echo "✅ Release v{$this->version} created successfully!\n";
    }

    private function updateVersionFiles()
    {
        echo "📝 Updating version files...\n";

        // Update version.json
        $versionData = json_decode(file_get_contents($this->projectRoot . '/version.json'), true);
        $versionData['version'] = $this->version;
        $versionData['release_date'] = date('Y-m-d');
        file_put_contents(
            $this->projectRoot . '/version.json',
            json_encode($versionData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n"
        );

        // Update package.json
        $packageData = json_decode(file_get_contents($this->projectRoot . '/package.json'), true);
        $packageData['version'] = $this->version;
        file_put_contents(
            $this->projectRoot . '/package.json',
            json_encode($packageData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n"
        );

        // Update composer.json if version field exists
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

    private function createReleaseDocumentation()
    {
        echo "📖 Creating release documentation...\n";

        $releaseDir = $this->projectRoot . '/docs/releases/v' . $this->getMajorMinor($this->version);
        if (!is_dir($releaseDir)) {
            mkdir($releaseDir, 0755, true);
        }

        // Create release notes from template
        $template = file_get_contents($this->projectRoot . '/docs/releases/templates/RELEASE_NOTES_TEMPLATE.md');
        $releaseNotes = $this->processTemplate($template);
        file_put_contents($releaseDir . '/RELEASE_NOTES_v' . $this->version . '.md', $releaseNotes);

        // Create changelog from template
        $changelogTemplate = file_get_contents($this->projectRoot . '/docs/releases/templates/CHANGELOG_TEMPLATE.md');
        $changelog = $this->processTemplate($changelogTemplate);
        file_put_contents($releaseDir . '/CHANGELOG_v' . $this->version . '.md', $changelog);

        echo "  ✅ Release documentation created\n";
    }

    private function generateChangelogEntry()
    {
        echo "📝 Generating changelog entry...\n";

        $changelogPath = $this->projectRoot . '/CHANGELOG.md';
        $changelog = file_exists($changelogPath) ? file_get_contents($changelogPath) : "# Changelog\n\n";

        $entry = $this->generateChangelogEntryContent();

        // Insert new entry after the header
        $lines = explode("\n", $changelog);
        $headerEnd = 0;
        for ($i = 0; $i < count($lines); $i++) {
            if (trim($lines[$i]) === '' && $i > 0) {
                $headerEnd = $i + 1;
                break;
            }
        }

        array_splice($lines, $headerEnd, 0, explode("\n", $entry));
        file_put_contents($changelogPath, implode("\n", $lines));

        echo "  ✅ Changelog updated\n";
    }

    private function createGitTag()
    {
        echo "🏷️ Creating git tag...\n";

        $tagName = 'v' . $this->version;
        $message = "Release v{$this->version}";

        exec("git add .", $output, $exitCode);
        if ($exitCode !== 0) {
            echo "  ⚠️ Warning: Could not stage files\n";
        }

        exec("git commit -m \"chore: prepare release v{$this->version}\"", $output, $exitCode);
        if ($exitCode !== 0) {
            echo "  ⚠️ Warning: Could not create commit\n";
        }

        exec("git tag -a {$tagName} -m \"{$message}\"", $output, $exitCode);
        if ($exitCode === 0) {
            echo "  ✅ Git tag {$tagName} created\n";
            echo "  💡 Run 'git push origin {$tagName}' to publish\n";
        } else {
            echo "  ⚠️ Warning: Could not create git tag\n";
        }
    }

    private function prepareBuild()
    {
        echo "🏗️ Preparing build for v{$this->version}...\n";

        $buildScript = $this->projectRoot . '/scripts/prepare-release.sh';
        if (file_exists($buildScript)) {
            exec("bash {$buildScript}", $output, $exitCode);
            if ($exitCode === 0) {
                echo "  ✅ Build prepared successfully\n";
            } else {
                echo "  ❌ Build preparation failed\n";
            }
        } else {
            echo "  ⚠️ No build script found\n";
        }
    }

    private function cleanupOldFiles()
    {
        echo "🧹 Cleaning up old files...\n";

        $filesToMove = [
            'RELEASE_NOTES_v0.9.0-beta.1.md' => 'archive/old-releases/',
            'RELEASE_NOTES_v0.9.46.md' => 'archive/old-releases/',
            'DEPLOYMENT_SUMMARY_v0.9.0-beta.1.md' => 'archive/old-releases/',
            'v0.9.3-IMPLEMENTATION-SUMMARY.md' => 'archive/deprecated-files/',
            'temp_v090_workflow.yml' => 'archive/deprecated-files/',
            'test_scan.php' => 'archive/deprecated-files/',
            'WORDPRESS_SCANNER_DOCS.md' => 'docs/',
            'GITHUB-PACKAGES.md' => 'docs/',
        ];

        foreach ($filesToMove as $file => $destination) {
            $sourcePath = $this->projectRoot . '/' . $file;
            $destPath = $this->projectRoot . '/' . $destination;

            if (file_exists($sourcePath)) {
                if (!is_dir($destPath)) {
                    mkdir($destPath, 0755, true);
                }
                rename($sourcePath, $destPath . basename($file));
                echo "  📦 Moved {$file} to {$destination}\n";
            }
        }

        echo "  ✅ Cleanup completed\n";
    }

    private function validateRelease()
    {
        echo "🔍 Validating release...\n";

        $errors = [];
        $warnings = [];

        // Check version consistency
        $versionJson = json_decode(file_get_contents($this->projectRoot . '/version.json'), true);
        $packageJson = json_decode(file_get_contents($this->projectRoot . '/package.json'), true);

        if ($versionJson['version'] !== $packageJson['version']) {
            $errors[] = "Version mismatch between version.json and package.json";
        }

        // Check required files
        $requiredFiles = [
            'CHANGELOG.md',
            'README.md',
            'version.json',
            'package.json'
        ];

        foreach ($requiredFiles as $file) {
            if (!file_exists($this->projectRoot . '/' . $file)) {
                $errors[] = "Missing required file: {$file}";
            }
        }

        // Check documentation structure
        $docsDir = $this->projectRoot . '/docs/releases';
        if (!is_dir($docsDir)) {
            $warnings[] = "Missing docs/releases directory";
        }

        if (empty($errors)) {
            echo "  ✅ Release validation passed\n";
            if (!empty($warnings)) {
                echo "  ⚠️ Warnings:\n";
                foreach ($warnings as $warning) {
                    echo "    - {$warning}\n";
                }
            }
        } else {
            echo "  ❌ Validation failed:\n";
            foreach ($errors as $error) {
                echo "    - {$error}\n";
            }
        }
    }

    private function showStatus()
    {
        echo "📊 Project Status\n";
        echo "===============\n\n";

        $versionData = json_decode(file_get_contents($this->projectRoot . '/version.json'), true);
        echo "Current Version: v{$versionData['version']}\n";
        echo "Release Date: {$versionData['release_date']}\n";
        echo "Stability: {$versionData['stability']}\n\n";

        // Count files in different categories
        $totalFiles = $this->countFiles($this->projectRoot);
        $docFiles = $this->countFiles($this->projectRoot . '/docs');
        $releaseFiles = $this->countFiles($this->projectRoot . '/releases');

        echo "File Counts:\n";
        echo "  - Total project files: {$totalFiles}\n";
        echo "  - Documentation files: {$docFiles}\n";
        echo "  - Release files: {$releaseFiles}\n";
    }

    private function processTemplate($template)
    {
        $versionData = json_decode(file_get_contents($this->projectRoot . '/version.json'), true);

        $replacements = [
            '{{version}}' => $this->version,
            '{{date}}' => date('F j, Y'),
            '{{year}}' => date('Y'),
            '{{codename}}' => $versionData['codename'] ?? 'Release',
            '{{description}}' => $versionData['description'] ?? 'Klioso Release',
        ];

        return str_replace(array_keys($replacements), array_values($replacements), $template);
    }

    private function generateChangelogEntryContent()
    {
        return "## [v{$this->version}] - " . date('Y-m-d') . "\n\n" .
               "### Added\n" .
               "- [Add new features here]\n\n" .
               "### Changed\n" .
               "- [Add changed features here]\n\n" .
               "### Fixed\n" .
               "- [Add bug fixes here]\n\n" .
               "### Security\n" .
               "- [Add security updates here]\n\n";
    }

    private function getMajorMinor($version)
    {
        $parts = explode('.', $version);
        return $parts[0] . '.' . $parts[1];
    }

    private function countFiles($directory)
    {
        if (!is_dir($directory)) {
            return 0;
        }

        $count = 0;
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($directory, RecursiveDirectoryIterator::SKIP_DOTS)
        );

        foreach ($iterator as $file) {
            if ($file->isFile()) {
                $count++;
            }
        }

        return $count;
    }

    private function loadConfig()
    {
        $configPath = $this->projectRoot . '/tools/release/config.json';
        if (file_exists($configPath)) {
            return json_decode(file_get_contents($configPath), true);
        }
        return $this->getDefaultConfig();
    }

    private function getDefaultConfig()
    {
        return [
            'project_name' => 'Klioso',
            'repository' => 'nathanmaster/Klioso',
            'main_branch' => 'main',
            'dev_branch' => 'dev',
            'auto_tag' => true,
            'auto_changelog' => true,
        ];
    }

    private function showUsage()
    {
        echo "Klioso Release Management Tool\n";
        echo "==============================\n\n";
        echo "Usage: php release-manager.php <command> [version]\n\n";
        echo "Commands:\n";
        echo "  create-release <version>  Create a new release\n";
        echo "  generate-docs <version>   Generate documentation only\n";
        echo "  prepare-build <version>   Prepare build artifacts\n";
        echo "  cleanup-old              Move old files to archive\n";
        echo "  validate                 Validate current release\n";
        echo "  status                   Show project status\n\n";
        echo "Examples:\n";
        echo "  php release-manager.php create-release 0.9.47\n";
        echo "  php release-manager.php cleanup-old\n";
        echo "  php release-manager.php status\n";
    }
}

// Run the tool
$manager = new ReleaseManager();
$manager->main($argv);
