// ProxyService: Rotates through a list of proxies for scraping
class ProxyService {
  constructor() {
    this.proxies = [];
    this.currentIndex = 0;
    this.loadProxies();
  }

  loadProxies() {
    // Load proxies from environment variable or config file
    // Format: "http://user:pass@ip:port,http://ip:port"
    const proxyString = process.env.PROXIES || "";
    this.proxies = proxyString.split(',').map(p => p.trim()).filter(Boolean);
    console.log(`Loaded ${this.proxies.length} proxies`);
  }

  getProxy() {
    if (this.proxies.length === 0) return null;
    const proxy = this.proxies[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.proxies.length;
    // Parse proxy string to Playwright format
    if (proxy.includes('@')) {
      const [auth, hostPort] = proxy.split('@');
      const [username, password] = auth.replace('http://', '').split(':');
      const [host, port] = hostPort.split(':');
      return {
        server: `http://${host}:${port}`,
        username,
        password
      };
    }
    return { server: proxy };
  }
}

export const proxyService = new ProxyService();
