<?php

namespace Database\Seeders;

use App\Models\Plugin;
use App\Models\Website;
use App\Models\Client;
use App\Models\HostingProvider;
use Illuminate\Database\Seeder;

class TestDataSeeder extends Seeder
{
    public function run(): void
    {
        // Create test client if none exists
        $client = Client::firstOrCreate(
            ['contact_email' => 'client@test.com'], // Search criteria
            [
                'name' => 'Test Client',
                'contact_email' => 'client@test.com',
                'contact_phone' => '555-0123',
            ]
        );

        // Create test hosting provider if none exists
        $hostingProvider = HostingProvider::firstOrCreate(
            ['name' => 'Test Hosting'], // Search criteria
            [
                'name' => 'Test Hosting',
                'description' => 'Test hosting provider',
                'website' => 'https://testhosting.com',
                'contact_info' => 'support@testhosting.com',
                'login_url' => 'https://cpanel.testhosting.com',
            ]
        );

        // Create test plugins if none exist
        $plugins = [
            [
                'name' => 'Contact Form 7',
                'description' => 'Just another contact form plugin for WordPress.',
                'is_paid' => false,
                'install_source' => 'WordPress Repository',
            ],
            [
                'name' => 'Yoast SEO',
                'description' => 'The first true all-in-one SEO solution for WordPress.',
                'is_paid' => false,
                'install_source' => 'WordPress Repository',
            ],
            [
                'name' => 'WooCommerce',
                'description' => 'The most customizable eCommerce platform for building your online business.',
                'is_paid' => false,
                'install_source' => 'WordPress Repository',
            ],
            [
                'name' => 'Elementor Pro',
                'description' => 'Advanced page builder plugin for WordPress.',
                'is_paid' => true,
                'purchase_url' => 'https://elementor.com/pro/',
                'install_source' => 'Third Party',
            ],
        ];

        foreach ($plugins as $pluginData) {
            Plugin::firstOrCreate(['name' => $pluginData['name']], $pluginData);
        }

        // Create test websites if none exist
        $websites = [
            [
                'domain_name' => 'example.com',
                'platform' => 'WordPress',
                'dns_provider' => 'Cloudflare',
                'status' => 'active',
                'notes' => 'Main company website',
                'client_id' => $client->id,
                'hosting_provider_id' => $hostingProvider->id,
            ],
            [
                'domain_name' => 'shop.example.com',
                'platform' => 'WooCommerce',
                'dns_provider' => 'Cloudflare',
                'status' => 'active',
                'notes' => 'E-commerce site',
                'client_id' => $client->id,
                'hosting_provider_id' => $hostingProvider->id,
            ],
        ];

        foreach ($websites as $websiteData) {
            Website::firstOrCreate(['domain_name' => $websiteData['domain_name']], $websiteData);
        }

        // Create some website-plugin relationships
        $website1 = Website::where('domain_name', 'example.com')->first();
        $website2 = Website::where('domain_name', 'shop.example.com')->first();
        
        $contactForm = Plugin::where('name', 'Contact Form 7')->first();
        $yoast = Plugin::where('name', 'Yoast SEO')->first();
        $woocommerce = Plugin::where('name', 'WooCommerce')->first();
        $elementor = Plugin::where('name', 'Elementor Pro')->first();

        if ($website1 && $contactForm) {
            $website1->plugins()->syncWithoutDetaching([
                $contactForm->id => ['version' => '5.8.1', 'is_active' => true],
                $yoast->id => ['version' => '21.5', 'is_active' => true],
                $elementor->id => ['version' => '3.18.1', 'is_active' => true],
            ]);
        }

        if ($website2 && $woocommerce) {
            $website2->plugins()->syncWithoutDetaching([
                $contactForm->id => ['version' => '5.8.1', 'is_active' => true],
                $yoast->id => ['version' => '21.5', 'is_active' => true],
                $woocommerce->id => ['version' => '8.2.1', 'is_active' => true],
                $elementor->id => ['version' => '3.18.1', 'is_active' => false],
            ]);
        }
    }
}
