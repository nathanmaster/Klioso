<?php

namespace Database\Seeders;

use App\Models\HostingProvider;
use Illuminate\Database\Seeder;

class HostingProviderSeeder extends Seeder
{
    public function run(): void
    {
        $providers = [
            [
                'name' => 'DigitalOcean',
                'description' => 'Cloud hosting provider with droplets and managed services',
                'website' => 'https://digitalocean.com',
                'contact_info' => 'support@digitalocean.com',
                'notes' => 'Great for developers, excellent documentation',
                'login_url' => 'https://cloud.digitalocean.com',
                'provides_hosting' => true,
                'provides_dns' => true,
                'provides_email' => false,
                'provides_domain_registration' => false,
            ],
            [
                'name' => 'Cloudflare',
                'description' => 'CDN and DNS provider with security features',
                'website' => 'https://cloudflare.com',
                'contact_info' => 'support@cloudflare.com',
                'notes' => 'Excellent for DNS and CDN services',
                'login_url' => 'https://dash.cloudflare.com',
                'provides_hosting' => false,
                'provides_dns' => true,
                'provides_email' => false,
                'provides_domain_registration' => true,
            ],
            [
                'name' => 'AWS',
                'description' => 'Amazon Web Services - comprehensive cloud platform',
                'website' => 'https://aws.amazon.com',
                'contact_info' => 'aws-support@amazon.com',
                'notes' => 'Enterprise-grade cloud services',
                'login_url' => 'https://console.aws.amazon.com',
                'provides_hosting' => true,
                'provides_dns' => true,
                'provides_email' => true,
                'provides_domain_registration' => false,
            ],
            [
                'name' => 'Namecheap',
                'description' => 'Domain registrar and hosting provider',
                'website' => 'https://namecheap.com',
                'contact_info' => 'support@namecheap.com',
                'notes' => 'Affordable domains and hosting',
                'login_url' => 'https://ap.www.namecheap.com',
                'provides_hosting' => true,
                'provides_dns' => true,
                'provides_email' => true,
                'provides_domain_registration' => true,
            ],
            [
                'name' => 'Google Cloud Platform',
                'description' => 'Google\'s cloud computing services',
                'website' => 'https://cloud.google.com',
                'contact_info' => 'cloud-support@google.com',
                'notes' => 'Strong in AI and machine learning services',
                'login_url' => 'https://console.cloud.google.com',
                'provides_hosting' => true,
                'provides_dns' => true,
                'provides_email' => false,
                'provides_domain_registration' => false,
            ],
        ];

        foreach ($providers as $provider) {
            HostingProvider::firstOrCreate(
                ['name' => $provider['name']],
                $provider
            );
        }
    }
}
