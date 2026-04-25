import React, { useState, useEffect } from 'react';

// Types
interface Campaign {
  id: string;
  title: string;
  description: string;
  target: number;
  pledged: number;
  deadline: number; // timestamp
  admin: string;
  status: 'Active' | 'Successful' | 'Failed';
}

function App() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [publicKey, setPublicKey] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Mock Data
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: '1',
      title: 'Decentralized AI Compute Cluster',
      description: 'Funding a community-owned GPU cluster for open-source AI researchers and developers.',
      target: 50000,
      pledged: 32450,
      deadline: Date.now() + 86400000 * 5, // 5 days from now
      admin: 'GQD...78X',
      status: 'Active'
    },
    {
      id: '2',
      title: 'Stellar Soroban Learn-to-Earn',
      description: 'An interactive platform rewarding developers with XLM for completing Soroban smart contract tutorials.',
      target: 10000,
      pledged: 12500,
      deadline: Date.now() - 86400000, // Passed
      admin: 'GBH...42A',
      status: 'Successful'
    },
    {
      id: '3',
      title: 'Solar-Powered Mesh Network Node',
      description: 'Building off-grid communication nodes for disaster relief operations using Stellar payment channels.',
      target: 25000,
      pledged: 4500,
      deadline: Date.now() + 86400000 * 12,
      admin: 'GAA...99Y',
      status: 'Active'
    }
  ]);

  const [newCampaign, setNewCampaign] = useState({
    title: '',
    description: '',
    target: '',
    durationDays: '7'
  });

  const [pledgeAmounts, setPledgeAmounts] = useState<Record<string, string>>({});

  const connectWallet = async () => {
    // Mock Freighter connection
    setWalletConnected(true);
    setPublicKey('GBX7C3...W3P2');
  };

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletConnected) {
      alert("Please connect wallet first");
      return;
    }
    
    const campaign: Campaign = {
      id: Math.random().toString(36).substring(7),
      title: newCampaign.title,
      description: newCampaign.description,
      target: Number(newCampaign.target),
      pledged: 0,
      deadline: Date.now() + Number(newCampaign.durationDays) * 86400000,
      admin: publicKey,
      status: 'Active'
    };

    setCampaigns([campaign, ...campaigns]);
    setShowCreateModal(false);
    setNewCampaign({ title: '', description: '', target: '', durationDays: '7' });
  };

  const handlePledge = (id: string) => {
    if (!walletConnected) {
      alert("Please connect your Freighter wallet to pledge.");
      return;
    }

    const amount = Number(pledgeAmounts[id] || 0);
    if (amount <= 0) return;

    setCampaigns(campaigns.map(c => {
      if (c.id === id) {
        const newPledged = c.pledged + amount;
        return {
          ...c,
          pledged: newPledged,
          status: newPledged >= c.target && c.deadline < Date.now() ? 'Successful' : c.status
        };
      }
      return c;
    }));

    setPledgeAmounts({ ...pledgeAmounts, [id]: '' });
    alert(`Successfully pledged ${amount} XLM to campaign!`);
  };

  const formatDaysLeft = (deadline: number) => {
    const diff = deadline - Date.now();
    if (diff <= 0) return 'Ended';
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return `${days} days left`;
  };

  return (
    <div className="container">
      <header>
        <div className="logo">Lumina Fund</div>
        <div>
          {walletConnected ? (
            <button className="btn btn-outline">{publicKey}</button>
          ) : (
            <button className="btn" onClick={connectWallet}>Connect Freighter</button>
          )}
        </div>
      </header>

      <div className="hero">
        <h1>Decentralized Crowdfunding<br />on Stellar Soroban</h1>
        <p>Launch your ideas or support the future of Web3. Trustless, transparent, and powered by smart contracts.</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button className="btn" onClick={() => setShowCreateModal(true)}>
            Start a Campaign
          </button>
          <button className="btn btn-outline" onClick={() => document.getElementById('campaigns')?.scrollIntoView({ behavior: 'smooth' })}>
            Explore Projects
          </button>
        </div>
      </div>

      <div id="campaigns" className="campaign-grid">
        {campaigns.map(campaign => {
          const progress = Math.min((campaign.pledged / campaign.target) * 100, 100);
          
          return (
            <div className="card" key={campaign.id}>
              <div className="card-header">
                <span className="status-badge" style={{ 
                  color: campaign.status === 'Active' ? 'var(--primary)' : 
                         campaign.status === 'Successful' ? 'var(--accent)' : 'var(--danger)',
                  borderColor: campaign.status === 'Active' ? 'rgba(59, 130, 246, 0.3)' : 
                               campaign.status === 'Successful' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)',
                  backgroundColor: campaign.status === 'Active' ? 'rgba(59, 130, 246, 0.1)' : 
                                   campaign.status === 'Successful' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                }}>
                  {campaign.status}
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {formatDaysLeft(campaign.deadline)}
                </span>
              </div>
              
              <h3 className="card-title">{campaign.title}</h3>
              <p className="card-desc">{campaign.description}</p>
              
              <div className="progress-container">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="progress-stats">
                  <span><span className="stat-value">{campaign.pledged.toLocaleString()}</span> XLM raised</span>
                  <span><span className="stat-value">{campaign.target.toLocaleString()}</span> XLM target</span>
                </div>
              </div>
              
              <div className="card-footer">
                {campaign.status === 'Active' ? (
                  <div className="input-group">
                    <input 
                      type="number" 
                      placeholder="XLM Amount" 
                      value={pledgeAmounts[campaign.id] || ''}
                      onChange={(e) => setPledgeAmounts({...pledgeAmounts, [campaign.id]: e.target.value})}
                    />
                    <button className="btn" onClick={() => handlePledge(campaign.id)}>Pledge</button>
                  </div>
                ) : campaign.status === 'Successful' && walletConnected && campaign.admin === publicKey ? (
                  <button className="btn" style={{ width: '100%' }}>Claim Funds</button>
                ) : campaign.status === 'Failed' ? (
                  <button className="btn btn-outline" style={{ width: '100%', color: 'var(--danger)', borderColor: 'var(--danger)' }}>Refund Available</button>
                ) : (
                  <button className="btn btn-outline" style={{ width: '100%' }} disabled>Campaign {campaign.status}</button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showCreateModal && (
        <div className="glass-modal">
          <div className="modal-content">
            <h2 className="modal-title">Launch Campaign</h2>
            <form onSubmit={handleCreateCampaign}>
              <div className="form-group">
                <label>Project Title</label>
                <input 
                  type="text" 
                  required 
                  value={newCampaign.title}
                  onChange={e => setNewCampaign({...newCampaign, title: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input 
                  type="text" 
                  required 
                  value={newCampaign.description}
                  onChange={e => setNewCampaign({...newCampaign, description: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Funding Target (XLM)</label>
                <input 
                  type="number" 
                  required 
                  min="1"
                  value={newCampaign.target}
                  onChange={e => setNewCampaign({...newCampaign, target: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Duration (Days)</label>
                <input 
                  type="number" 
                  required 
                  min="1"
                  max="60"
                  value={newCampaign.durationDays}
                  onChange={e => setNewCampaign({...newCampaign, durationDays: e.target.value})}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn">Deploy Contract</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
