document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const receivedSection = document.getElementById('invitations-received-section');
  const sentSection = document.getElementById('invitations-sent-section');
  const receivedContainer = document.getElementById('received-invitations');
  const sentContainer = document.getElementById('sent-invitations');
  const noReceivedMessage = document.getElementById('no-received-invitations');
  const noSentMessage = document.getElementById('no-sent-invitations');
  const tabs = document.querySelectorAll('.invitation-tab');
  const refreshReceivedBtn = document.getElementById('refresh-received');
  const refreshSentBtn = document.getElementById('refresh-sent');
  const statusFilterReceived = document.getElementById('status-filter-received');
  const statusFilterSent = document.getElementById('status-filter-sent');
  
  // View modals
  const viewProjectModal = document.getElementById('view-project-modal');
  const closeViewModalBtn = document.getElementById('close-view-modal');
  const closeViewBtn = document.getElementById('close-view-btn');
  
  const viewResearcherModal = document.getElementById('view-researcher-modal');
  const closeResearcherModalBtn = document.getElementById('close-researcher-modal');
  const closeResearcherBtn = document.getElementById('close-researcher-btn');
  
  const cancelInvitationModal = document.getElementById('cancel-invitation-modal');
  const closeCancelModalBtn = document.getElementById('close-cancel-modal');
  const cancelCancelBtn = document.getElementById('cancel-cancel-invitation');
  const confirmCancelBtn = document.getElementById('confirm-cancel-invitation');
  
  const respondInvitationModal = document.getElementById('respond-invitation-modal');
  const closeRespondModalBtn = document.getElementById('close-respond-modal');
  const closeRespondBtn = document.getElementById('close-respond-btn');
  const acceptInvitationBtn = document.getElementById('accept-invitation');
  const declineInvitationBtn = document.getElementById('decline-invitation');
  
  // State variables
  let currentTab = 'received';
  let sentInvitations = [];
  let receivedInvitations = [];
  let currentInvitationId = null;
  
  // API endpoints
  const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:3000/api' 
    : 'https://collabnexus-bvgne7b6bqg0cadp.canadacentral-01.azurewebsites.net/api';

  const RECEIVED_INVITATIONS_ENDPOINT = `${API_BASE_URL}/received_invitations`;
  const SENT_INVITATIONS_ENDPOINT = `${API_BASE_URL}/project_invitations`; 
  const INVITATIONS_ENDPOINT = `${API_BASE_URL}/invitations`; // For operations like updating status
const PROJECTS_API = `${API_BASE_URL}/projects`;

  // Tab switching logic
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const tabType = this.getAttribute('data-tab');
      
      // Remove active class from all tabs
      tabs.forEach(t => t.classList.remove('active'));
      
      // Add active class to clicked tab
      this.classList.add('active');
      
      // Show/hide appropriate sections
      if (tabType === 'received') {
        receivedSection.classList.remove('hidden');
        sentSection.classList.add('hidden');
        currentTab = 'received';
      } else {
        receivedSection.classList.add('hidden');
        sentSection.classList.remove('hidden');
        currentTab = 'sent';
      }
    });
  });
  
  // Fetch received invitations from API
  async function fetchReceivedInvitations() {
    try {
      // Show loading state before fetch
      receivedContainer.innerHTML = '<section class="loading-spinner"><i class="fas fa-circle-notch fa-spin"></i><nav>Loading invitations...</nav></section>';
      
      const response = await fetch(RECEIVED_INVITATIONS_ENDPOINT);
      if (!response.ok) {
        throw new Error('Failed to fetch received invitations');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching received invitations:', error);
      showToast('Error loading received invitations. Please try again.', 'error');
      return [];
    }
  }
  
  // Fetch sent invitations from API
  async function fetchSentInvitations() {
    try {
      // Show loading state before fetch
      sentContainer.innerHTML = '<section class="loading-spinner"><i class="fas fa-circle-notch fa-spin"></i><nav>Loading invitations...</nav></section>';
      
      const response = await fetch(SENT_INVITATIONS_ENDPOINT);
      if (!response.ok) {
        throw new Error('Failed to fetch sent invitations');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching sent invitations:', error);
      showToast('Error loading sent invitations. Please try again.', 'error');
      return [];
    }
  }
  
  // Initialize and load invitations
  async function initInvitations() {
    receivedInvitations = await fetchReceivedInvitations();
    sentInvitations = await fetchSentInvitations();
    
    renderReceivedInvitations();
    renderSentInvitations();
  }
  
  // Parse JSON strings from database if needed
  function parseJsonField(jsonString) {
    if (!jsonString) return [];
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Error parsing JSON field:', error);
      return [];
    }
  }
  
  // Render received invitations
  function renderReceivedInvitations(statusFilter = 'all') {
    let filteredInvites = receivedInvitations;
    
    if (statusFilter !== 'all') {
      filteredInvites = receivedInvitations.filter(invite => invite.status === statusFilter);
    }
    
    if (filteredInvites.length === 0) {
      receivedContainer.innerHTML = '';
      noReceivedMessage.classList.remove('hidden');
    } else {
      noReceivedMessage.classList.add('hidden');
      
      const invitationsHTML = filteredInvites.map(invitation => {
        // Format date
        const date = new Date(invitation.invited_date).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
        
        // Status badge
        let statusBadge = '';
        if (invitation.status === 'pending') {
          statusBadge = '<nav class="badge badge-pending">Pending</nav>';
        } else if (invitation.status === 'accepted') {
          statusBadge = '<nav class="badge badge-success">Accepted</nav>';
        } else if (invitation.status === 'declined') {
          statusBadge = '<nav class="badge badge-danger">Declined</nav>';
        }
        
        // Action buttons (only show if pending)
        let actionButtons = '';
        if (invitation.status === 'pending') {
          actionButtons = `
            <button class="btn btn-sm btn-success respond-btn" data-invitation-id="${invitation.id}" data-action="accept">
              <i class="fas fa-check mr-1"></i> Accept
            </button>
            <button class="btn btn-sm btn-danger respond-btn" data-invitation-id="${invitation.id}" data-action="decline">
              <i class="fas fa-times mr-1"></i> Decline
            </button>
          `;
        }
        
        // Parse skills if they exist (assuming they might be stored as JSON string)
        const requiredSkills = invitation.key_research_area ? 
          parseJsonField(invitation.key_research_area) : [];
        
        // Parse messages if they exist
        const messages = invitation.messages ? 
          parseJsonField(invitation.messages) : [];
        
        return `
          <section class="invitation-card">
            <section class="invitation-header">
              <h3 class="invitation-project-title">${invitation.projectTitle || 'Project Invitation'}</h3>
              ${statusBadge}
            </section>
            <section class="invitation-body">
              <section class="invitation-sender">
                <nav class="sender-label">From:</nav>
                <a href="#" class="sender-name view-researcher" data-researcher-id="${invitation.invitedByEmail}">
                  ${invitation.invitedByName || 'Researcher'}
                </a>
                <nav class="sender-title">${invitation.invitedByTitle || ''}</nav>
                <nav class="sender-institution">${invitation.invitedByInstitution || ''}</nav>
              </section>
              <section class="invitation-info">
                <section class="info-item">
                  <i class="fas fa-calendar-alt"></i> Invited on ${date}
                </section>
                <section class="info-item">
                  <i class="fas fa-clock"></i> Duration: ${invitation.duration || 'Not specified'}
                </section>
              </section>
              <p class="invitation-description">${invitation.description || 'No description provided.'}</p>
              ${requiredSkills.length > 0 ? `
                <section class="required-skills">
                  <nav class="skills-label">Required Skills:</nav>
                  <section class="skills-list">
                    ${requiredSkills.map(skill => `<nav class="skill-tag">${skill}</nav>`).join('')}
                  </section>
                </section>
              ` : ''}
            </section>
            <section class="invitation-footer">
              <button class="btn btn-outline btn-sm view-project-btn" data-project-id="${invitation.projectId}">
                <i class="fas fa-eye mr-1"></i> View Project
              </button>
              <section class="invitation-actions">
                ${actionButtons}
              </section>
            </section>
          </section>
        `;
      }).join('');
      
      receivedContainer.innerHTML = invitationsHTML;
      
      // Add event listeners to the newly created buttons
      attachEventListeners();
    }
  }
  
  // Render sent invitations
  function renderSentInvitations(statusFilter = 'all') {
    let filteredInvites = sentInvitations;
    
    if (statusFilter !== 'all') {
      filteredInvites = sentInvitations.filter(invite => invite.status === statusFilter);
    }
    
    if (filteredInvites.length === 0) {
      sentContainer.innerHTML = '';
      noSentMessage.classList.remove('hidden');
    } else {
      noSentMessage.classList.add('hidden');
      
      const invitationsHTML = filteredInvites.map(invitation => {
        // Format date
        const date = new Date(invitation.created_at).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
        
        // Status badge
        let statusBadge = '';
        if (invitation.status === 'pending') {
          statusBadge = '<nav class="badge badge-pending">Pending</nav>';
        } else if (invitation.status === 'accepted') {
          statusBadge = '<nav class="badge badge-success">Accepted</nav>';
        } else if (invitation.status === 'declined') {
          statusBadge = '<nav class="badge badge-danger">Declined</nav>';
        } else if (invitation.status === 'cancelled') {
          statusBadge = '<nav class="badge badge-danger">Cancelled</nav>';
        }
        
                // Action buttons (only show cancel if pending)
        let actionButtons = '';
        if (invitation.status === 'pending') {
            actionButtons = `
                <button class="btn btn-sm btn-danger cancel-invite-btn" data-invitation-id="${invitation.id}">
                    <i class="fas fa-ban mr-1"></i> Cancel
                </button>
            `;
        }
        
        // Parse skills if they exist
        const requiredSkills = invitation.key_research_area ? 
          parseJsonField(invitation.key_research_area) : [];
        
        // Parse messages if they exist
        const messages = invitation.messages ? 
          parseJsonField(invitation.messages) : [];
        
        return `
          <section class="invitation-card">
            <section class="invitation-header">
              <h3 class="invitation-project-title">${invitation.projectTitle || 'Project Invitation'}</h3>
              ${statusBadge}
            </section>
            <section class="invitation-body">
              <section class="invitation-recipient">
                <nav class="recipient-label">To:</nav>
                <a href="#" class="recipient-name view-researcher" data-researcher-id="${invitation.email}">
                  ${invitation.name || 'Researcher'}
                </a>
                <nav class="recipient-title">${invitation.projectTitle || ''}</nav>
                <nav class="recipient-institution">${invitation.university || ''}</nav>
              </section>
              <section class="invitation-info">
                <section class="info-item">
                  <i class="fas fa-calendar-alt"></i> Sent on ${date}
                </section>
                <section class="info-item">
                  <i class="fas fa-clock"></i> Duration: ${invitation.duration || 'Not specified'}
                </section>
              </section>
              <p class="invitation-description">${invitation.description || 'No description provided.'}</p>
              ${requiredSkills.length > 0 ? `
                <section class="required-skills">
                  <nav class="skills-label">Required Skills:</nav>
                  <section class="skills-list">
                    ${requiredSkills.map(skill => `<nav class="skill-tag">${skill}</nav>`).join('')}
                  </section>
                </section>
              ` : ''}
              
              ${invitation.status !== 'pending' && messages.length > 0 ? `
                <section class="invitation-response">
                  <nav class="response-label">Response:</nav>
                  <p class="response-message">${messages[messages.length - 1].text || 'No message provided.'}</p>
                </section>
              ` : ''}
            </section>
            <section class="invitation-footer">
              <button class="btn btn-outline btn-sm view-project-btn" data-project-id="${invitation.projectId}">
                <i class="fas fa-eye mr-1"></i> View Project
              </button>
              <section class="invitation-actions">
                ${actionButtons}
              </section>
            </section>
          </section>
        `;
      }).join('');
      
      sentContainer.innerHTML = invitationsHTML;
      
      // Add event listeners to the newly created buttons
      attachEventListeners();
    }
  }

  // Attach event listeners to dynamically created elements
  function attachEventListeners() {
    // View project button listeners
    document.querySelectorAll('.view-project-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const projectId = this.getAttribute('data-project-id');
        viewProject(projectId);
      });
    });
    
    // View researcher profile listeners
    document.querySelectorAll('.view-researcher').forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const researcherId = this.getAttribute('data-researcher-id');
        viewResearcher(researcherId);
      });
    });
    
    // Respond to invitation button listeners
    document.querySelectorAll('.respond-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const invitationId = this.getAttribute('data-invitation-id');
        const action = this.getAttribute('data-action');
        openRespondModal(invitationId, action);
      });
    });
    
    // Cancel invitation button listeners
    document.querySelectorAll('.cancel-invite-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const invitationId = this.getAttribute('data-invitation-id');
        openCancelModal(invitationId);
      });
    });
  }
  
  // Filter handlers
  statusFilterReceived.addEventListener('change', function() {
    renderReceivedInvitations(this.value);
  });
  
  statusFilterSent.addEventListener('change', function() {
    renderSentInvitations(this.value);
  });
  
  // Refresh button handlers
  refreshReceivedBtn.addEventListener('click', async function() {
    receivedInvitations = await fetchReceivedInvitations();
    renderReceivedInvitations();
    showToast('Received invitations refreshed', 'success');
  });
  
  refreshSentBtn.addEventListener('click', async function() {
    sentInvitations = await fetchSentInvitations();
    renderSentInvitations();
    showToast('Sent invitations refreshed', 'success');
  });
  
  // View project details
  function viewProject(projectId) {
    const projectDetails = document.getElementById('project-details');
    projectDetails.innerHTML = '<section class="loading-spinner"><i class="fas fa-circle-notch fa-spin"></i><nav>Loading project details...</nav></section>';
    
    document.getElementById('view-project-title').textContent = `Project Details: ${projectId}`;
    
    // In a real application, you would fetch project details from the API
    // For this example, we'll simulate with placeholder content
    setTimeout(() => {
      projectDetails.innerHTML = `
        <section class="project-detail-item">
          <h3 class="project-title">${projectId}: Climate Impact on Marine Ecosystems</h3>
          <p class="project-status"><nav class="badge badge-active">Active</nav></p>
        </section>
        <section class="project-detail-item">
          <nav class="detail-label">Principal Investigator:</nav>
          <nav class="detail-value">Dr. Robert Anderson</nav>
        </section>
        <section class="project-detail-item">
          <nav class="detail-label">Institution:</nav>
          <nav class="detail-value">Ocean Research Institute</nav>
        </section>
        <section class="project-detail-item">
          <nav class="detail-label">Timeline:</nav>
          <nav class="detail-value">Jan 2025 - Dec 2026</nav>
        </section>
        <section class="project-detail-item">
          <nav class="detail-label">Description:</nav>
          <p class="detail-value">This project aims to study the impact of climate change on marine ecosystems with a focus on coral reefs and coastal environments. Using advanced machine learning algorithms, we'll analyze environmental data to predict future changes and develop conservation strategies.</p>
        </section>
        <section class="project-detail-item">
          <nav class="detail-label">Funding:</nav>
          <nav class="detail-value">National Science Foundation, Global Climate Initiative</nav>
        </section>
      `;
      
      document.getElementById('project-requirements').innerHTML = `
        <nav class="skill-tag">Machine Learning</nav>
        <nav class="skill-tag">Environmental Science</nav>
        <nav class="skill-tag">Marine Biology</nav>
        <nav class="skill-tag">Data Analysis</nav>
        <nav class="skill-tag">Python</nav>
        <nav class="skill-tag">R</nav>
      `;
      
      document.getElementById('project-collaborators').innerHTML = `
        <section class="collaborator-item">
          <section class="collaborator-avatar">
            <i class="fas fa-user-circle"></i>
          </section>
          <section class="collaborator-info">
            <nav class="collaborator-name">Dr. Robert Anderson</nav>
            <nav class="collaborator-role">Principal Investigator</nav>
          </section>
        </section>
        <section class="collaborator-item">
          <section class="collaborator-avatar">
            <i class="fas fa-user-circle"></i>
          </section>
          <section class="collaborator-info">
            <nav class="collaborator-name">Dr. Anna Williams</nav>
            <nav class="collaborator-role">Co-Investigator</nav>
          </section>
        </section>
      `;
    }, 800);
    
    viewProjectModal.classList.add('active');
  }
  
  // View researcher profile
  function viewResearcher(researcherId) {
    const researcherProfile = document.getElementById('researcher-profile');
    researcherProfile.innerHTML = '<section class="loading-spinner"><i class="fas fa-circle-notch fa-spin"></i><nav>Loading researcher profile...</nav></section>';
    
    // Find the researcher in our data
    let researcher = receivedInvitations.find(invitation => 
      invitation.invitedByEmail === researcherId
    );
    
    // If not found in received invitations, try sent invitations
    if (!researcher) {
      researcher = sentInvitations.find(invitation => 
        invitation.invitedEmail === researcherId
      );
    }
    
    if (researcher) {
      // Set the header based on whether we're viewing a sender or recipient
      const isRecipient = !!researcher.invitedEmail;
      const name = isRecipient ? researcher.invitedName : researcher.invitedByName;
      const title = isRecipient ? researcher.invitedTitle : researcher.invitedByTitle;
      const institution = isRecipient ? researcher.invitedInstitution : researcher.invitedByInstitution;
      const email = isRecipient ? researcher.invitedEmail : researcher.invitedByEmail;
      
      document.getElementById('researcher-name-title').textContent = name || 'Researcher';
      
      setTimeout(() => {
        researcherProfile.innerHTML = `
          <section class="researcher-header">
            <section class="researcher-avatar">
              <i class="fas fa-user-circle fa-3x"></i>
            </section>
            <section class="researcher-basic-info">
              <h3 class="researcher-name">${name || 'Researcher'}</h3>
              <p class="researcher-title">${title || 'Researcher'}</p>
              <p class="researcher-institution">${institution || 'Institution not specified'}</p>
              <p class="researcher-contact"><i class="fas fa-envelope"></i> ${email}</p>
            </section>
          </section>
          
          <section class="researcher-section">
            <h4 class="section-title">About</h4>
            <p>Researcher at ${institution || 'their institution'}.</p>
          </section>
          
          <section class="researcher-section">
            <h4 class="section-title">Current Projects</h4>
            <p class="text-muted">Information not available</p>
          </section>
          
          <section class="researcher-section">
            <h4 class="section-title">Recent Publications</h4>
            <p class="text-muted">Information not available</p>
          </section>
        `;
      }, 800);
    } else {
      // Fallback for when researcher is not found
      document.getElementById('researcher-name-title').textContent = 'Researcher Profile';
      researcherProfile.innerHTML = `
        <section class="alert alert-warning">
          <i class="fas fa-exclamation-triangle"></i>
          Researcher information could not be loaded.
        </section>
      `;
    }
    
    viewResearcherModal.classList.add('active');
  }
  
  // Open cancel invitation modal
  function openCancelModal(invitationId) {
    currentInvitationId = invitationId;
    
    // Find the invitation in our data
    const invitation = sentInvitations.find(inv => inv.id === invitationId);
    
    if (invitation) {
      document.getElementById('cancel-invitation-details').innerHTML = `
        <section>
          <p>Are you sure you want to cancel this invitation?</p>
          <p><strong>Project:</strong> ${invitation.projectTitle || 'Research Project'}</p>
          <p><strong>To:</strong> ${invitation.invitedName || 'Researcher'}, ${invitation.invitedInstitution || 'Institution'}</p>
          <p><strong>Status:</strong> ${invitation.status}</p>
          <p class="text-danger">This action cannot be undone.</p>
        </section>
      `;
      
      cancelInvitationModal.classList.add('active');
    } else {
      showToast('Invitation not found', 'error');
    }
  }
  
  // Open respond to invitation modal
  function openRespondModal(invitationId, action) {
    currentInvitationId = invitationId;
    
    // Find the invitation in our data
    const invitation = receivedInvitations.find(inv => inv.id === invitationId);
    
    if (invitation) {
      // Pre-focus the appropriate button based on the action
      if (action === 'accept') {
        acceptInvitationBtn.focus();
      } else if (action === 'decline') {
        declineInvitationBtn.focus();
      }
      
      document.getElementById('respond-invitation-details').innerHTML = `
        <section>
          <p><strong>Project:</strong> ${invitation.projectTitle || 'Research Project'}</p>
          <p><strong>From:</strong> ${invitation.invitedByName || 'Researcher'}, ${invitation.invitedByInstitution || 'Institution'}</p>
          <p><strong>Description:</strong> ${invitation.description || 'No description provided.'}</p>
        </section>
      `;
      
      respondInvitationModal.classList.add('active');
    } else {
      showToast('Invitation not found', 'error');
    }
  }
  
  // Update invitation status using RECEIVED_INVITATIONS_ENDPOINT
  async function updateInvitationStatus(invitationId, status, message = '') {
    try {
      // First get the current invitation to update
      const getResponse = await fetch(`${RECEIVED_INVITATIONS_ENDPOINT}/${invitationId}`);
      if (!getResponse.ok) {
        throw new Error('Failed to fetch invitation details');
      }
      
      const currentInvitation = await getResponse.json();
      
      // Prepare the updated data
      const updatedData = {
        ...currentInvitation,
        status: status
      };
      
      // Add message to messages if provided
      if (message) {
        let messages = [];
        if (currentInvitation.messages) {
          try {
            messages = JSON.parse(currentInvitation.messages);
          } catch (e) {
            messages = [];
          }
        }
        
        messages.push({
          sender: 'you',
          text: message,
          date: new Date().toISOString()
        });
        
        updatedData.messages = JSON.stringify(messages);
      }
      
      // Update the invitation using PUT
      const updateResponse = await fetch(`${RECEIVED_INVITATIONS_ENDPOINT}/${invitationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
      
      if (!updateResponse.ok) {
        throw new Error('Failed to update invitation status');
      }
      
      const data = await updateResponse.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error updating invitation status:', error);
      throw error;
    }
  }
  

async function deleteInvitation(invitationId) {
    try {
        // First, get the invitation details
        const invitationResponse = await fetch(`${SENT_INVITATIONS_ENDPOINT}/${invitationId}`);
        if (!invitationResponse.ok) {
            throw new Error('Failed to fetch invitation details');
        }
        const invitation = await invitationResponse.json();

        // Update the invitation status to 'cancelled'
        const updateResponse = await fetch(`${SENT_INVITATIONS_ENDPOINT}/${invitationId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...invitation,
                status: 'cancelled'
            }),
        });

        if (!updateResponse.ok) {
            throw new Error('Failed to update invitation status');
        }

        return true;
    } catch (error) {
        console.error('Error cancelling invitation:', error);
        throw error;
    }
}
  
confirmCancelBtn.addEventListener('click', async function() {
    if (!currentInvitationId) return;
    
    confirmCancelBtn.disabled = true;
    confirmCancelBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Processing...';
    
    try {
        // Cancel the invitation
        await deleteInvitation(currentInvitationId);
        
        // Update local data
        const index = sentInvitations.findIndex(inv => inv.id === currentInvitationId);
        if (index !== -1) {
            sentInvitations[index].status = 'cancelled';
        }
        
        // Close modal and refresh view
        cancelInvitationModal.classList.remove('active');
        renderSentInvitations(statusFilterSent.value);
        
        showToast('Invitation cancelled successfully', 'success');
    } catch (error) {
        console.error('Error cancelling invitation:', error);
        showToast('Failed to cancel invitation. Please try again.', 'error');
    } finally {
        confirmCancelBtn.disabled = false;
        confirmCancelBtn.innerHTML = 'Yes, Cancel Invitation';
        currentInvitationId = null;
    }
});
  // Respond to invitation handlers
  acceptInvitationBtn.addEventListener('click', async function() {
    await respondToInvitation('accepted');
  });
  
  declineInvitationBtn.addEventListener('click', async function() {
    await respondToInvitation('declined');
  });
  
  // Respond to invitation function (accept/decline)
  async function respondToInvitation(response) {
    if (!currentInvitationId) return;
    
    const responseMessage = document.getElementById('response-message').value;
    
    // Disable buttons during processing
    acceptInvitationBtn.disabled = true;
    declineInvitationBtn.disabled = true;
    
    const actionBtn = response === 'accepted' ? acceptInvitationBtn : declineInvitationBtn;
    const originalBtnText = actionBtn.innerHTML;
    actionBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Processing...';
    
    try {
      // Make API call to update invitation status
      await updateInvitationStatus(currentInvitationId, response, responseMessage);
      
      // Update local data
      const index = receivedInvitations.findIndex(inv => inv.id === currentInvitationId);
      if (index !== -1) {
        receivedInvitations[index].status = response;
        
        // Update messages if provided
        if (responseMessage) {
          let messages = [];
          if (receivedInvitations[index].messages) {
            try {
              messages = JSON.parse(receivedInvitations[index].messages);
            } catch (e) {
              messages = [];
            }
          }
          
          messages.push({
            sender: 'you',
            text: responseMessage,
            date: new Date().toISOString()
          });
          
          receivedInvitations[index].messages = JSON.stringify(messages);
        }
      }
      
      // Also update the corresponding sent invitation if it exists
      const sentIndex = sentInvitations.findIndex(inv => inv.id === currentInvitationId);
      if (sentIndex !== -1) {
        sentInvitations[sentIndex].status = response;
        
        if (responseMessage) {
          let sentMessages = [];
          if (sentInvitations[sentIndex].messages) {
            try {
              sentMessages = JSON.parse(sentInvitations[sentIndex].messages);
            } catch (e) {
              sentMessages = [];
            }
          }
          
          sentMessages.push({
            sender: 'recipient',
            text: responseMessage,
            date: new Date().toISOString()
          });
          
          sentInvitations[sentIndex].messages = JSON.stringify(sentMessages);
        }
      }
      
      // Close modal and refresh views
      respondInvitationModal.classList.remove('active');
      document.getElementById('response-message').value = '';
      renderReceivedInvitations(statusFilterReceived.value);
      renderSentInvitations(statusFilterSent.value);
      
      const actionText = response === 'accepted' ? 'accepted' : 'declined';
      showToast(`Invitation ${actionText} successfully`, 'success');
    } catch (error) {
      console.error(`Error ${response} invitation:`, error);
      showToast(`Failed to ${response} invitation. Please try again.`, 'error');
    } finally {
      // Reset buttons
      acceptInvitationBtn.disabled = false;
      declineInvitationBtn.disabled = false;
      actionBtn.innerHTML = originalBtnText;
      currentInvitationId = null;
    }
  }

  // Close modal handlers
  function closeAllModals() {
    viewProjectModal.classList.remove('active');
    viewResearcherModal.classList.remove('active');
    cancelInvitationModal.classList.remove('active');
    respondInvitationModal.classList.remove('active');
    currentInvitationId = null;
  }

  // Add click event listeners for closing modals
  closeViewModalBtn.addEventListener('click', closeAllModals);
  closeViewBtn.addEventListener('click', closeAllModals);
  closeResearcherModalBtn.addEventListener('click', closeAllModals);
  closeResearcherBtn.addEventListener('click', closeAllModals);
  closeCancelModalBtn.addEventListener('click', closeAllModals);
  cancelCancelBtn.addEventListener('click', closeAllModals);
  closeRespondModalBtn.addEventListener('click', closeAllModals);
  closeRespondBtn.addEventListener('click', closeAllModals);

  // Also close modals when clicking outside the modal content
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', function(e) {
      if (e.target === this) {
        closeAllModals();
      }
    });
  });

  // Toast notification system
  function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('section');
    toast.className = `toast toast-${type}`;
    
    let icon = '';
    if (type === 'success') icon = '<i class="fas fa-check-circle"></i>';
    else if (type === 'error') icon = '<i class="fas fa-exclamation-circle"></i>';
    else if (type === 'warning') icon = '<i class="fas fa-exclamation-triangle"></i>';
    else icon = '<i class="fas fa-info-circle"></i>';
    
    toast.innerHTML = `
      ${icon}
      <nav class="toast-message">${message}</nav>
    `;
    
    toastContainer.appendChild(toast);
    
    // Show the toast
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Remove the toast after 3 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toastContainer.contains(toast)) {
          toastContainer.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }

  // Handle escape key to close modals
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeAllModals();
    }
  });

  // Initialize the invitations
  initInvitations();
});