import axios from 'axios';

/**
 * Data Enrichment Service
 * Provides various enrichment capabilities for scraped data
 */
export class EnrichmentService {
  constructor() {
    // Configure API keys (in production, these would come from environment variables)
    this.config = {
      emailVerificationApiKey: process.env.EMAIL_VERIFICATION_API_KEY || '',
      companyInfoApiKey: process.env.COMPANY_INFO_API_KEY || '',
      socialProfileApiKey: process.env.SOCIAL_PROFILE_API_KEY || '',
      phoneValidationApiKey: process.env.PHONE_VALIDATION_API_KEY || ''
    };
  }

  /**
   * Enrich data with multiple enrichments
   * @param {Object} data - The scraped data to enrich
   * @param {Array} enrichmentTypes - Types of enrichment to apply
   * @returns {Promise<Object>} - Enriched data
   */
  async enrichData(data, enrichmentTypes) {
    let enriched = { ...data };
    for (const type of enrichmentTypes) {
      switch (type) {
        case 'email':
          enriched.emails = this.extractEmailsFromData(enriched);
          break;
        case 'phone':
          enriched.phones = this.extractPhonesFromData(enriched);
          break;
        case 'company':
          enriched.companyInfo = { name: 'Demo Corp', industry: 'Tech' };
          break;
        case 'address':
          enriched.addresses = this.extractAddressesFromData(enriched);
          break;
        case 'website':
          enriched.websites = this.extractWebsitesFromData(enriched);
          break;
        case 'jobTitle':
          enriched.jobTitles = this.extractJobTitlesFromData(enriched);
          break;
        case 'skills':
          enriched.skills = this.extractSkillsFromData(enriched);
          break;
        case 'location':
          enriched.locations = this.extractLocationsFromData(enriched);
          break;
        // Add more enrichment types as needed
      }
    }
    return enriched;
  }

  /**
   * Enrich data with email verification
   * @param {Object} data - Data to enrich
   * @returns {Promise<Object>} - Data with verified emails
   */
  async enrichWithEmails(data) {
    console.log('Enriching with email verification...');
    
    // Find potential email fields in the data
    const emailFields = this.findFieldsOfType(data, 'email');
    
    if (emailFields.length === 0) {
      // Try to extract emails from text content
      data.extractedEmails = this.extractEmailsFromText(data);
      emailFields.push('extractedEmails');
    }
    
    // Process each email field
    for (const field of emailFields) {
      if (Array.isArray(data[field])) {
        const verifiedEmails = [];
        
        for (const item of data[field]) {
          const email = typeof item === 'string' ? item : item.text || item.email;
          
          if (!email || typeof email !== 'string') continue;
          
          try {
            // In production, connect to a real email verification API
            // For demonstration, we'll use a simple validation
            const isValid = this.validateEmailFormat(email);
            const verification = {
              email,
              valid: isValid,
              deliverable: isValid,
              fullName: this.guessNameFromEmail(email),
              confidence: isValid ? 0.8 : 0.2
            };
            
            verifiedEmails.push(verification);
          } catch (error) {
            console.error(`Error verifying email ${email}:`, error);
            verifiedEmails.push({
              email,
              valid: false,
              error: error.message
            });
          }
        }
        
        // Replace original data with enriched data
        data[`${field}_verified`] = verifiedEmails;
      }
    }
    
    return data;
  }

  /**
   * Simple email format validation
   * @param {string} email - Email to validate
   * @returns {boolean} - Whether the email format is valid
   */
  validateEmailFormat(email) {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
  }

  /**
   * Extract potential name from email address
   * @param {string} email - Email address
   * @returns {string} - Extracted name
   */
  guessNameFromEmail(email) {
    if (!email || typeof email !== 'string') return '';
    
    const localPart = email.split('@')[0];
    
    // Convert dots and underscores to spaces
    let name = localPart.replace(/[._]/g, ' ');
    
    // Capitalize each word
    name = name.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    return name;
  }
  
  /**
   * Extract emails from text content
   * @param {Object} data - Data containing text
   * @returns {Array} - Extracted emails
   */
  extractEmailsFromText(data) {
    const emailRegex = /[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}/g;
    const emails = new Set();
    
    // Search through all text fields
    Object.values(data).forEach(field => {
      if (Array.isArray(field)) {
        field.forEach(item => {
          if (typeof item === 'string') {
            const matches = item.match(emailRegex);
            if (matches) matches.forEach(email => emails.add(email));
          } else if (item && typeof item === 'object' && item.text) {
            const matches = item.text.match(emailRegex);
            if (matches) matches.forEach(email => emails.add(email));
          }
        });
      }
    });
    
    return Array.from(emails).map(email => ({ text: email }));
  }

  /**
   * Extract emails from text using regex
   */
  extractEmailsFromData(data) {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    let emails = [];
    for (const key in data) {
      if (Array.isArray(data[key])) {
        data[key].forEach(item => {
          if (item.text) {
            const found = item.text.match(emailRegex);
            if (found) emails.push(...found);
          }
        });
      }
    }
    return [...new Set(emails)];
  }

  /**
   * Enrich data with company information
   * @param {Object} data - Data to enrich
   * @returns {Promise<Object>} - Data with company information
   */
  async enrichWithCompanyInfo(data) {
    console.log('Enriching with company information...');
    
    // Find potential company fields or domain names
    const companyFields = this.findFieldsOfType(data, 'company');
    const domainFields = this.findFieldsOfType(data, 'domain');
    
    // First try to get domains from company names
    if (companyFields.length > 0) {
      data.companyInfo = [];
      
      for (const field of companyFields) {
        if (Array.isArray(data[field])) {
          for (const item of data[field]) {
            const companyName = typeof item === 'string' ? item : item.text;
            
            if (!companyName) continue;
            
            try {
              // In production, connect to a company info API like Clearbit
              // For demonstration, we'll generate mock data
              const companyInfo = await this.getMockCompanyInfo(companyName);
              data.companyInfo.push(companyInfo);
            } catch (error) {
              console.error(`Error getting company info for ${companyName}:`, error);
            }
          }
        }
      }
    }
    
    // Then try to get company info from domains
    if (domainFields.length > 0) {
      if (!data.companyInfo) data.companyInfo = [];
      
      for (const field of domainFields) {
        if (Array.isArray(data[field])) {
          for (const item of data[field]) {
            const domain = typeof item === 'string' ? item : item.text;
            
            if (!domain) continue;
            
            try {
              // In production, connect to a company info API
              const companyInfo = await this.getMockCompanyInfo(null, domain);
              data.companyInfo.push(companyInfo);
            } catch (error) {
              console.error(`Error getting company info for domain ${domain}:`, error);
            }
          }
        }
      }
    }
    
    // Extract domains from URLs if no explicit domains found
    if ((!domainFields.length && !companyFields.length) || !data.companyInfo) {
      data.companyInfo = [];
      const domains = this.extractDomainsFromData(data);
      
      for (const domain of domains) {
        try {
          const companyInfo = await this.getMockCompanyInfo(null, domain);
          data.companyInfo.push(companyInfo);
        } catch (error) {
          console.error(`Error getting company info for domain ${domain}:`, error);
        }
      }
    }
    
    return data;
  }

  /**
   * Mock company information retrieval
   * In production, replace with actual API calls
   * @param {string} companyName - Company name
   * @param {string} domain - Company domain
   * @returns {Promise<Object>} - Company information
   */
  async getMockCompanyInfo(companyName, domain) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Use domain to generate company name if not provided
    if (!companyName && domain) {
      companyName = domain.split('.')[0]
        .replace(/-/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    
    // Use company name to generate domain if not provided
    if (!domain && companyName) {
      domain = companyName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';
    }
    
    // Create random company info
    const industries = ['Technology', 'Finance', 'Healthcare', 'Education', 'Manufacturing', 'Retail'];
    const sizes = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];
    const countries = ['United States', 'United Kingdom', 'Canada', 'Germany', 'France', 'Australia'];
    
    return {
      name: companyName,
      domain: domain,
      logo: `https://logo.clearbit.com/${domain}`,
      industry: industries[Math.floor(Math.random() * industries.length)],
      description: `${companyName} is a leading provider of solutions in the ${
        industries[Math.floor(Math.random() * industries.length)]
      } industry.`,
      foundedYear: 2000 + Math.floor(Math.random() * 23),
      size: sizes[Math.floor(Math.random() * sizes.length)],
      location: countries[Math.floor(Math.random() * countries.length)],
      linkedin: `https://www.linkedin.com/company/${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      twitter: `https://twitter.com/${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      employees: (10 + Math.floor(Math.random() * 990)).toString()
    };
  }
  
  /**
   * Extract domains from URLs in data
   * @param {Object} data - Data containing URLs
   * @returns {Array} - Extracted domains
   */
  extractDomainsFromData(data) {
    const domains = new Set();
    
    // Extract domains from any URLs in the data
    Object.values(data).forEach(field => {
      if (Array.isArray(field)) {
        field.forEach(item => {
          if (typeof item === 'string' && item.includes('http')) {
            try {
              const url = new URL(item);
              domains.add(url.hostname);
            } catch (e) {}
          } else if (item && typeof item === 'object') {
            if (item.href && item.href.includes('http')) {
              try {
                const url = new URL(item.href);
                domains.add(url.hostname);
              } catch (e) {}
            }
            if (item.url && item.url.includes('http')) {
              try {
                const url = new URL(item.url);
                domains.add(url.hostname);
              } catch (e) {}
            }
            if (item.text && item.text.includes('http')) {
              try {
                const url = new URL(item.text);
                domains.add(url.hostname);
              } catch (e) {}
            }
          }
        });
      }
    });
    
    return Array.from(domains);
  }

  /**
   * Enrich data with social media profiles
   * @param {Object} data - Data to enrich
   * @returns {Promise<Object>} - Data with social profiles
   */
  async enrichWithSocialProfiles(data) {
    console.log('Enriching with social profiles...');
    
    // Look for name fields to search social profiles
    const nameFields = this.findFieldsOfType(data, 'name');
    const emailFields = this.findFieldsOfType(data, 'email');
    
    if (nameFields.length === 0 && emailFields.length === 0) {
      console.log('No names or emails found for social profile enrichment');
      return data;
    }
    
    data.socialProfiles = [];
    
    // Process names
    for (const field of nameFields) {
      if (Array.isArray(data[field])) {
        for (const item of data[field]) {
          const name = typeof item === 'string' ? item : item.text;
          
          if (!name) continue;
          
          try {
            // In production, connect to a social profile API
            const profiles = await this.getMockSocialProfiles(name);
            data.socialProfiles.push({
              name,
              profiles
            });
          } catch (error) {
            console.error(`Error getting social profiles for ${name}:`, error);
          }
        }
      }
    }
    
    // Process emails if no names found
    if (data.socialProfiles.length === 0) {
      for (const field of emailFields) {
        if (Array.isArray(data[field])) {
          for (const item of data[field]) {
            const email = typeof item === 'string' ? item : item.text || item.email;
            
            if (!email) continue;
            
            try {
              const name = this.guessNameFromEmail(email);
              const profiles = await this.getMockSocialProfiles(name, email);
              data.socialProfiles.push({
                email,
                name,
                profiles
              });
            } catch (error) {
              console.error(`Error getting social profiles for ${email}:`, error);
            }
          }
        }
      }
    }
    
    return data;
  }

  /**
   * Mock social profile retrieval
   * In production, replace with actual API calls
   * @param {string} name - Person's name
   * @param {string} email - Person's email
   * @returns {Promise<Object>} - Social profiles
   */
  async getMockSocialProfiles(name, email) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const profiles = {};
    const normalizedName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Randomly determine which profiles to include
    if (Math.random() > 0.3) {
      profiles.linkedin = {
        url: `https://www.linkedin.com/in/${normalizedName}`,
        followers: Math.floor(Math.random() * 5000)
      };
    }
    
    if (Math.random() > 0.4) {
      profiles.twitter = {
        url: `https://twitter.com/${normalizedName}`,
        followers: Math.floor(Math.random() * 10000)
      };
    }
    
    if (Math.random() > 0.6) {
      profiles.facebook = {
        url: `https://facebook.com/${normalizedName}`,
        private: Math.random() > 0.5
      };
    }
    
    if (Math.random() > 0.7) {
      profiles.github = {
        url: `https://github.com/${normalizedName}`,
        repositories: Math.floor(Math.random() * 50)
      };
    }
    
    return profiles;
  }

  /**
   * Enrich data with LinkedIn profile lookup (mock or real API)
   */
  async enrichWithLinkedIn(data) {
    // Example: Use name or email to lookup LinkedIn profile
    const nameFields = this.findFieldsOfType(data, 'name');
    const emailFields = this.findFieldsOfType(data, 'email');
    data.linkedinProfiles = [];
    for (const field of nameFields) {
      if (Array.isArray(data[field])) {
        for (const item of data[field]) {
          const name = typeof item === 'string' ? item : item.text;
          if (!name) continue;
          // In production, call LinkedIn API or a 3rd-party enrichment API
          data.linkedinProfiles.push({
            name,
            url: `https://www.linkedin.com/in/${name.toLowerCase().replace(/[^a-z0-9]/g, '')}`
          });
        }
      }
    }
    // Fallback: use email if no name
    if (data.linkedinProfiles.length === 0) {
      for (const field of emailFields) {
        if (Array.isArray(data[field])) {
          for (const item of data[field]) {
            const email = typeof item === 'string' ? item : item.text || item.email;
            if (!email) continue;
            const name = this.guessNameFromEmail(email);
            data.linkedinProfiles.push({
              email,
              url: `https://www.linkedin.com/in/${name.toLowerCase().replace(/[^a-z0-9]/g, '')}`
            });
          }
        }
      }
    }
    return data;
  }

  /**
   * Enrich data with Twitter profile lookup (mock or real API)
   */
  async enrichWithTwitter(data) {
    const nameFields = this.findFieldsOfType(data, 'name');
    data.twitterProfiles = [];
    for (const field of nameFields) {
      if (Array.isArray(data[field])) {
        for (const item of data[field]) {
          const name = typeof item === 'string' ? item : item.text;
          if (!name) continue;
          data.twitterProfiles.push({
            name,
            url: `https://twitter.com/${name.toLowerCase().replace(/[^a-z0-9]/g, '')}`
          });
        }
      }
    }
    return data;
  }

  /**
   * Enrich data with Github profile lookup (mock or real API)
   */
  async enrichWithGithub(data) {
    const nameFields = this.findFieldsOfType(data, 'name');
    data.githubProfiles = [];
    for (const field of nameFields) {
      if (Array.isArray(data[field])) {
        for (const item of data[field]) {
          const name = typeof item === 'string' ? item : item.text;
          if (!name) continue;
          data.githubProfiles.push({
            name,
            url: `https://github.com/${name.toLowerCase().replace(/[^a-z0-9]/g, '')}`
          });
        }
      }
    }
    return data;
  }

  /**
   * Enrich data with phone number validation
   * @param {Object} data - Data to enrich
   * @returns {Promise<Object>} - Data with validated phone numbers
   */
  async enrichWithPhoneValidation(data) {
    console.log('Enriching with phone validation...');
    
    // Find potential phone fields
    const phoneFields = this.findFieldsOfType(data, 'phone');
    
    if (phoneFields.length === 0) {
      // Try to extract phone numbers from text
      data.extractedPhones = this.extractPhonesFromText(data);
      phoneFields.push('extractedPhones');
    }
    
    // Process each phone field
    for (const field of phoneFields) {
      if (Array.isArray(data[field])) {
        const validatedPhones = [];
        
        for (const item of data[field]) {
          const phone = typeof item === 'string' ? item : item.text || item.phone;
          
          if (!phone) continue;
          
          try {
            // In production, connect to a phone validation API
            const validation = await this.validatePhone(phone);
            validatedPhones.push(validation);
          } catch (error) {
            console.error(`Error validating phone ${phone}:`, error);
            validatedPhones.push({
              original: phone,
              valid: false,
              error: error.message
            });
          }
        }
        
        data[`${field}_validated`] = validatedPhones;
      }
    }
    
    return data;
  }

  /**
   * Mock phone validation
   * In production, replace with actual API call
   * @param {string} phone - Phone number to validate
   * @returns {Promise<Object>} - Validation result
   */
  async validatePhone(phone) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Basic phone cleanup
    const cleaned = phone.replace(/[^0-9+]/g, '');
    
    // Determine if valid based on length and starting digits
    const isValid = (cleaned.length >= 10 && cleaned.length <= 15) && 
                    (cleaned.startsWith('+') || cleaned.startsWith('00') || 
                     cleaned.startsWith('1') || cleaned.startsWith('0'));
    
    // Mock carrier and location data
    const carriers = ['Verizon', 'AT&T', 'T-Mobile', 'Sprint', 'Vodafone', 'Orange'];
    const countries = ['United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Australia'];
    
    return {
      original: phone,
      formatted: isValid ? this.formatPhoneNumber(cleaned) : cleaned,
      valid: isValid,
      type: isValid ? (Math.random() > 0.7 ? 'mobile' : 'landline') : 'unknown',
      carrier: isValid ? carriers[Math.floor(Math.random() * carriers.length)] : null,
      country: isValid ? countries[Math.floor(Math.random() * countries.length)] : null,
      countryCode: isValid ? (cleaned.startsWith('+') ? cleaned.substring(1, 3) : '1') : null
    };
  }

  /**
   * Format phone number for display
   * @param {string} phone - Raw phone number
   * @returns {string} - Formatted phone number
   */
  formatPhoneNumber(phone) {
    if (phone.startsWith('+')) {
      // International format
      return phone;
    } else if (phone.length === 10) {
      // US format
      return `+1 (${phone.substring(0, 3)}) ${phone.substring(3, 6)}-${phone.substring(6)}`;
    } else {
      return phone;
    }
  }
  
  /**
   * Extract phone numbers from text
   * @param {Object} data - Data containing text
   * @returns {Array} - Extracted phones
   */
  extractPhonesFromText(data) {
    // Phone regex that catches various formats
    const phoneRegex = /(\+?[0-9]{1,3}[- ]?)?(\([0-9]{3}\)|[0-9]{3})[- ]?[0-9]{3}[- ]?[0-9]{4}/g;
    const phones = new Set();
    
    // Search through all text fields
    Object.values(data).forEach(field => {
      if (Array.isArray(field)) {
        field.forEach(item => {
          if (typeof item === 'string') {
            const matches = item.match(phoneRegex);
            if (matches) matches.forEach(phone => phones.add(phone));
          } else if (item && typeof item === 'object' && item.text) {
            const matches = item.text.match(phoneRegex);
            if (matches) matches.forEach(phone => phones.add(phone));
          }
        });
      }
    });
    
    return Array.from(phones).map(phone => ({ text: phone }));
  }

  /**
   * Extract phone numbers from text using regex
   */
  extractPhonesFromData(data) {
    const phoneRegex = /(?:\+\d{1,3}[-.\s]?)?(?:\(\d{1,4}\)|\d{1,4})[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g;
    let phones = [];
    for (const key in data) {
      if (Array.isArray(data[key])) {
        data[key].forEach(item => {
          if (item.text) {
            const found = item.text.match(phoneRegex);
            if (found) phones.push(...found);
          }
        });
      }
    }
    return [...new Set(phones)];
  }

  /**
   * Extract addresses from data (mock implementation)
   */
  extractAddressesFromData(data) {
    // Simple regex for US addresses (mock)
    const addressRegex = /\d+ [\w .]+, [\w .]+, [A-Z]{2} \d{5}/g;
    let addresses = [];
    for (const key in data) {
      if (Array.isArray(data[key])) {
        data[key].forEach(item => {
          if (item.text) {
            const found = item.text.match(addressRegex);
            if (found) addresses.push(...found);
          }
        });
      }
    }
    return [...new Set(addresses)];
  }

  /**
   * Extract websites from data (mock implementation)
   */
  extractWebsitesFromData(data) {
    const websiteRegex = /https?:\/\/[\w.-]+\.[a-z]{2,}/gi;
    let websites = [];
    for (const key in data) {
      if (Array.isArray(data[key])) {
        data[key].forEach(item => {
          if (item.text) {
            const found = item.text.match(websiteRegex);
            if (found) websites.push(...found);
          }
        });
      }
    }
    return [...new Set(websites)];
  }

  /**
   * Extract job titles from data (mock implementation)
   */
  extractJobTitlesFromData(data) {
    // Look for fields named 'title', 'position', etc.
    const titles = [];
    Object.keys(data).forEach(key => {
      if (key.toLowerCase().includes('title') || key.toLowerCase().includes('position')) {
        if (Array.isArray(data[key])) {
          data[key].forEach(item => {
            if (typeof item === 'string') titles.push(item);
            else if (item && item.text) titles.push(item.text);
          });
        }
      }
    });
    return [...new Set(titles)];
  }

  /**
   * Extract skills from data (mock implementation)
   */
  extractSkillsFromData(data) {
    // Look for fields named 'skills', or try to extract from text
    const skills = [];
    Object.keys(data).forEach(key => {
      if (key.toLowerCase().includes('skill')) {
        if (Array.isArray(data[key])) {
          data[key].forEach(item => {
            if (typeof item === 'string') skills.push(item);
            else if (item && item.text) skills.push(item.text);
          });
        }
      }
    });
    return [...new Set(skills)];
  }

  /**
   * Extract locations from data (mock implementation)
   */
  extractLocationsFromData(data) {
    // Look for fields named 'location', 'city', 'state', etc.
    const locations = [];
    Object.keys(data).forEach(key => {
      if (key.toLowerCase().includes('location') || key.toLowerCase().includes('city') || key.toLowerCase().includes('state')) {
        if (Array.isArray(data[key])) {
          data[key].forEach(item => {
            if (typeof item === 'string') locations.push(item);
            else if (item && item.text) locations.push(item.text);
          });
        }
      }
    });
    return [...new Set(locations)];
  }

  /**
   * Find fields of a specific type in the data
   * @param {Object} data - Data to search
   * @param {string} type - Type of field to find
   * @returns {Array} - Field names
   */
  findFieldsOfType(data, type) {
    const fields = [];
    
    // Look for field names containing the type
    Object.keys(data).forEach(key => {
      if (key.toLowerCase().includes(type)) {
        fields.push(key);
      }
    });
    
    return fields;
  }
}

// Export singleton instance
export const enrichmentService = new EnrichmentService();
