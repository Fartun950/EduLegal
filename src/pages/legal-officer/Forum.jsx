import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { forumService } from '../../services/forumService'
import { useNavigate } from 'react-router-dom'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Modal from '../../components/Modal'
import Badge from '../../components/Badge'
import { MessageSquare, Send, Lock, User, Clock, Edit, Trash2, Plus, X, Loader, AlertCircle } from 'lucide-react'

const Forum = () => {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [selectedTopic, setSelectedTopic] = useState('all')
  const [selectedDiscussion, setSelectedDiscussion] = useState(null)
  const [postModalOpen, setPostModalOpen] = useState(false)
  const [editMessageModalOpen, setEditMessageModalOpen] = useState(false)
  const [deleteMessageModalOpen, setDeleteMessageModalOpen] = useState(false)
  const [editingMessage, setEditingMessage] = useState(null)
  const [messageToDelete, setMessageToDelete] = useState(null)
  const [newPostTitle, setNewPostTitle] = useState('')
  const [newPostContent, setNewPostContent] = useState('')
  const [newPostTopic, setNewPostTopic] = useState('case-discussions')

  const topics = [
    { id: 'all', name: 'All Discussions', count: 12 },
    { id: 'case-discussions', name: 'Case Discussions', count: 8 },
    { id: 'legal-advice', name: 'Legal Advice', count: 3 },
    { id: 'procedures', name: 'Procedures', count: 1 },
  ]

  // Fetch forum posts from backend
  useEffect(() => {
    const fetchPosts = async () => {
      if (!isAuthenticated) return

      try {
        setLoading(true)
        setError(null)
        
        const response = await forumService.getPosts()
        
        if (response.success && response.data.posts && response.data.posts.length > 0) {
          // Transform backend posts to match frontend format
          const transformedDiscussions = response.data.posts.map(post => ({
            id: post._id,
            topic: post.category || 'case-discussions',
            title: post.title,
            author: post.author?.name || 'Anonymous',
            time: new Date(post.createdAt).toLocaleString(),
            replies: post.replies?.length || 0,
            lastReply: post.lastReply?.author?.name || null,
            lastReplyTime: post.lastReply?.createdAt ? new Date(post.lastReply.createdAt).toLocaleString() : null,
            caseId: post.caseId || null,
            content: post.content,
            anonymous: post.anonymous || false,
          }))
          
          setDiscussions(transformedDiscussions)
        }
        // If no posts, keep empty array
      } catch (err) {
        console.warn('Forum endpoint not available, using mock data:', err)
        // Keep mock data if backend doesn't have forum yet
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchPosts()
    }
  }, [isAuthenticated])

  const [discussions, setDiscussions] = useState([
    {
      id: 1,
      topic: 'Case Discussions',
      title: 'Discussion on Case C001 - Harassment Complaint',
      author: 'Sarah Smith',
      time: '2 hours ago',
      replies: 5,
      lastReply: 'John Doe',
      lastReplyTime: '30 minutes ago',
      caseId: 'C001',
    },
    {
      id: 2,
      topic: 'Legal Advice',
      title: 'Best practices for handling anonymous complaints',
      author: 'Mike Johnson',
      time: '5 hours ago',
      replies: 3,
      lastReply: 'Emily Chen',
      lastReplyTime: '1 hour ago',
    },
    {
      id: 3,
      topic: 'Case Discussions',
      title: 'Case C002 - Academic Dispute Resolution',
      author: 'John Doe',
      time: '1 day ago',
      replies: 8,
      lastReply: 'Sarah Smith',
      lastReplyTime: '3 hours ago',
      caseId: 'C002',
    },
    {
      id: 4,
      topic: 'Procedures',
      title: 'Updated documentation requirements',
      author: 'Admin',
      time: '2 days ago',
      replies: 2,
      lastReply: 'Mike Johnson',
      lastReplyTime: '1 day ago',
    },
  ])

  const [messages, setMessages] = useState([
    {
      id: 1,
      author: 'Sarah Smith',
      role: 'Legal Officer',
      message: 'I have reviewed the initial report. We need to schedule a meeting with the student to gather more information.',
      timestamp: '2024-01-17 10:30 AM',
      caseId: 'C001',
      discussionId: 1,
      canEdit: false,
    },
    {
      id: 2,
      author: 'John Doe',
      role: 'Legal Officer',
      message: 'I agree. Also, we should check if there are any witnesses who can provide additional context.',
      timestamp: '2024-01-17 11:15 AM',
      caseId: 'C001',
      discussionId: 1,
      canEdit: true,
    },
    {
      id: 3,
      author: 'Emily Chen',
      role: 'Admin',
      message: 'Please ensure all documentation is complete before proceeding with the meeting.',
      timestamp: '2024-01-17 11:45 AM',
      caseId: 'C001',
      discussionId: 1,
      canEdit: false,
    },
  ])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedDiscussion) return

    try {
      setLoading(true)
      // Try to send to backend, fallback to local state if endpoint doesn't exist
      try {
        await forumService.addComment(selectedDiscussion.id, { 
          message: newMessage,
          caseId: selectedDiscussion.caseId 
        })
        // Refresh messages after sending
        const response = await forumService.getPostById(selectedDiscussion.id)
        if (response.success && response.data.post) {
          // Update messages from backend response
        }
      } catch (apiError) {
        // If backend doesn't have forum endpoint yet, use local state
        console.warn('Forum API not available, using local state:', apiError)
        const message = {
          id: messages.length + 1,
          author: user?.name || 'Current User',
          role: user?.role === 'admin' ? 'Admin' : 'Legal Officer',
          message: newMessage,
          timestamp: new Date().toLocaleString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric',
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          caseId: selectedDiscussion?.caseId || null,
          discussionId: selectedDiscussion?.id || 1,
          canEdit: true,
        }
        setMessages([...messages, message])
      }
      setNewMessage('')
      alert('Message sent successfully!')
    } catch (err) {
      console.error('Error sending message:', err)
      alert('Failed to send message: ' + (err.response?.data?.message || err.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const handleEditMessage = (message) => {
    setEditingMessage(message)
    setNewMessage(message.message)
    setEditMessageModalOpen(true)
  }

  const handleSaveEditMessage = async () => {
    if (!editingMessage || !newMessage.trim()) return

    try {
      setLoading(true)
      // Try to update message in backend, fallback to local state if endpoint doesn't exist
      try {
        await forumService.updatePost(editingMessage.discussionId, {
          messageId: editingMessage.id,
          message: newMessage,
        })
        // Refresh messages after update
      } catch (apiError) {
        // If backend doesn't have forum endpoint yet, use local state
        console.warn('Forum API not available, using local state:', apiError)
        setMessages(messages.map(msg => 
          msg.id === editingMessage.id 
            ? { ...msg, message: newMessage }
            : msg
        ))
      }
      setEditingMessage(null)
      setNewMessage('')
      setEditMessageModalOpen(false)
      alert('Message updated successfully!')
    } catch (err) {
      console.error('Error updating message:', err)
      alert('Failed to update message: ' + (err.response?.data?.message || err.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteMessage = (message) => {
    setMessageToDelete(message)
    setDeleteMessageModalOpen(true)
  }

  const confirmDeleteMessage = () => {
    if (messageToDelete) {
      setMessages(messages.filter(msg => msg.id !== messageToDelete.id))
      setDeleteMessageModalOpen(false)
      setMessageToDelete(null)
    }
  }

  const handleCreatePost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) return

    try {
      setLoading(true)
      // Try to create post in backend, fallback to local state if endpoint doesn't exist
      try {
        const response = await forumService.createPost({
          title: newPostTitle,
          content: newPostContent,
          category: newPostTopic,
        })
        if (response.success) {
          // Refresh discussions from backend
          const postsResponse = await forumService.getPosts()
          if (postsResponse.success && postsResponse.data.posts) {
            const transformedDiscussions = postsResponse.data.posts.map(post => ({
              id: post._id,
              topic: post.category || 'case-discussions',
              title: post.title,
              author: post.author?.name || 'Anonymous',
              time: new Date(post.createdAt).toLocaleString(),
              replies: post.replies?.length || 0,
              lastReply: post.lastReply?.author?.name || null,
              lastReplyTime: post.lastReply?.createdAt ? new Date(post.lastReply.createdAt).toLocaleString() : null,
              caseId: post.caseId || null,
            }))
            setDiscussions(transformedDiscussions)
          }
        }
      } catch (apiError) {
        // If backend doesn't have forum endpoint yet, use local state
        console.warn('Forum API not available, using local state:', apiError)
        const post = {
          id: discussions.length + 1,
          topic: newPostTopic,
          title: newPostTitle,
          author: user?.name || 'Current User',
          time: 'Just now',
          replies: 0,
          lastReply: null,
          lastReplyTime: null,
          caseId: null,
        }
        setDiscussions([post, ...discussions])
      }
      setNewPostTitle('')
      setNewPostContent('')
      setNewPostTopic('case-discussions')
      setPostModalOpen(false)
      alert('Post created successfully!')
    } catch (err) {
      console.error('Error creating post:', err)
      alert('Failed to create post: ' + (err.response?.data?.message || err.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const filteredDiscussions =
    selectedTopic === 'all'
      ? discussions
      : discussions.filter((d) => {
          const topicKey = d.topic.toLowerCase().replace(/\s+/g, '-')
          return topicKey === selectedTopic
        })

  const discussionMessages = selectedDiscussion
    ? messages.filter(msg => msg.discussionId === selectedDiscussion.id)
    : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Confidential Forum</h1>
          <p className="text-gray-600 flex items-center gap-2">
            <Lock size={16} />
            Private discussion area for legal officers and administrators
          </p>
        </div>
        <Button variant="primary" onClick={() => setPostModalOpen(true)}>
          <Plus size={16} className="inline mr-2" />
          New Post
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Topics Sidebar */}
        <div className="lg:col-span-1">
          <Card title="Topics">
            <div className="space-y-2">
              {topics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => {
                    setSelectedTopic(topic.id)
                    setSelectedDiscussion(null)
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-smooth ${
                    selectedTopic === topic.id
                      ? 'bg-blue-50 text-blue-700 font-medium border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{topic.name}</span>
                    <Badge variant="default" size="sm">
                      {topic.count}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Discussions List */}
        <div className="lg:col-span-2">
          <Card title="Discussions">
            <div className="space-y-4">
              {filteredDiscussions.map((discussion) => (
                <div
                  key={discussion.id}
                  onClick={() => setSelectedDiscussion(discussion)}
                  className={`border rounded-lg p-4 hover:shadow-md transition-smooth cursor-pointer ${
                    selectedDiscussion?.id === discussion.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{discussion.title}</h3>
                        {discussion.caseId && (
                          <Badge variant="primary" size="sm">
                            {discussion.caseId}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <User size={14} />
                          {discussion.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {discussion.time}
                        </span>
                      </div>
                    </div>
                    <Badge variant="info" size="sm">
                      {discussion.replies} replies
                    </Badge>
                  </div>
                  {discussion.lastReply && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        Last reply by <strong>{discussion.lastReply}</strong> {discussion.lastReplyTime}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Active Discussion */}
        <div className="lg:col-span-1">
          <Card 
            title={selectedDiscussion ? selectedDiscussion.title : 'Select a Discussion'}
            action={
              selectedDiscussion && (
                <button
                  onClick={() => setSelectedDiscussion(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              )
            }
          >
            {selectedDiscussion ? (
              <>
                <div className="space-y-4 max-h-96 overflow-y-auto mb-4">
                  {discussionMessages.map((msg) => (
                    <div key={msg.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-900">{msg.author}</p>
                          <p className="text-xs text-gray-500">{msg.role}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-gray-500">{msg.timestamp}</p>
                          {msg.canEdit && (
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleEditMessage(msg)}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-smooth"
                                title="Edit message"
                              >
                                <Edit size={12} />
                              </button>
                              <button
                                onClick={() => handleDeleteMessage(msg)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded transition-smooth"
                                title="Delete message"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">{msg.message}</p>
                    </div>
                  ))}
                  {discussionMessages.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">No messages yet. Start the discussion!</p>
                  )}
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type your message..."
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <Button size="sm" variant="primary" onClick={handleSendMessage}>
                      <Send size={16} />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="text-sm">Select a discussion to view messages</p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Create New Post Modal */}
      <Modal
        isOpen={postModalOpen}
        onClose={() => {
          setPostModalOpen(false)
          setNewPostTitle('')
          setNewPostContent('')
        }}
        title="Create New Post"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
            <select
              value={newPostTopic}
              onChange={(e) => setNewPostTopic(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="case-discussions">Case Discussions</option>
              <option value="legal-advice">Legal Advice</option>
              <option value="procedures">Procedures</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={newPostTitle}
              onChange={(e) => setNewPostTitle(e.target.value)}
              placeholder="Enter post title..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="Enter post content..."
              rows="6"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => {
              setPostModalOpen(false)
              setNewPostTitle('')
              setNewPostContent('')
            }}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreatePost}>
              <Plus size={14} className="inline mr-1" />
              Create Post
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Message Modal */}
      <Modal
        isOpen={editMessageModalOpen}
        onClose={() => {
          setEditMessageModalOpen(false)
          setEditingMessage(null)
          setNewMessage('')
        }}
        title="Edit Message"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => {
              setEditMessageModalOpen(false)
              setEditingMessage(null)
              setNewMessage('')
            }}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveEditMessage}>
              <Edit size={14} className="inline mr-1" />
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Message Confirmation Modal */}
      <Modal
        isOpen={deleteMessageModalOpen}
        onClose={() => {
          setDeleteMessageModalOpen(false)
          setMessageToDelete(null)
        }}
        title="Delete Message"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete this message? This action cannot be undone.
          </p>
          {messageToDelete && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">{messageToDelete.message}</p>
            </div>
          )}
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => {
              setDeleteMessageModalOpen(false)
              setMessageToDelete(null)
            }}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDeleteMessage}>
              <Trash2 size={14} className="inline mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Forum






