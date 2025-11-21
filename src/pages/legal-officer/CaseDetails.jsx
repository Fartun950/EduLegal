import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { caseService } from '../../services/caseService'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Modal from '../../components/Modal'
import Badge from '../../components/Badge'
import { 
  ArrowLeft, 
  MessageSquare, 
  FileText, 
  User, 
  Calendar, 
  AlertCircle, 
  Edit, 
  Save, 
  X, 
  Lock, 
  Plus, 
  Upload,
  Trash2,
  CheckCircle,
  Clock,
  Loader
} from 'lucide-react'

const CaseDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [forumModalOpen, setForumModalOpen] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [noteModalOpen, setNoteModalOpen] = useState(false)
  const [deleteNoteModalOpen, setDeleteNoteModalOpen] = useState(false)
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [newNote, setNewNote] = useState('')
  const [editingNoteId, setEditingNoteId] = useState(null)
  const [editNoteText, setEditNoteText] = useState('')
  const [noteToDelete, setNoteToDelete] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updating, setUpdating] = useState(false)

  // Fetch case from backend
  useEffect(() => {
    const fetchCase = async () => {
      if (!id) {
        setError('Case ID is required')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        const response = await caseService.getCaseById(id)
        
        if (response.success && response.data.case) {
          const c = response.data.case
          
          // Calculate progress based on status
          let progress = 0
          if (c.status === 'open') progress = 30
          else if (c.status === 'inProgress') progress = 60
          else if (c.status === 'closed') progress = 100
          
          setCaseData({
            id: c._id?.substring(0, 8).toUpperCase() || id,
            _id: c._id,
            title: c.title,
            student: c.createdBy?.name || 'Anonymous',
            studentId: c.createdBy?._id || 'N/A',
            email: c.createdBy?.email || 'N/A',
            status: c.status === 'open' ? 'Open' : c.status === 'inProgress' ? 'In Progress' : c.status === 'closed' ? 'Closed' : 'Pending',
            priority: c.priority ? c.priority.charAt(0).toUpperCase() + c.priority.slice(1) : 'Medium',
            date: new Date(c.createdAt).toLocaleDateString(),
            description: c.description || '',
            category: c.category || 'Other',
            progress: progress,
            documents: [], // Backend doesn't have documents yet
            timeline: [
              { id: 1, date: new Date(c.createdAt).toLocaleDateString(), event: 'Case created', user: c.createdBy?.name || 'System' },
              ...(c.assignedTo ? [{ id: 2, date: new Date(c.updatedAt).toLocaleDateString(), event: 'Assigned to Legal Officer', user: 'Admin' }] : []),
            ],
            forumMessages: [], // Backend doesn't have forum yet
            assignedTo: c.assignedTo?.name || null,
            assignedToId: c.assignedTo?._id || null,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
          })
        } else {
          setError('Case not found')
        }
      } catch (err) {
        console.error('Error fetching case:', err)
        setError(err.response?.data?.message || 'Failed to load case')
        
        // Don't redirect on auth errors - allow access without authentication
        // if (err.response?.status === 401 || err.response?.status === 403) {
        //   navigate('/welcome')
        // }
      } finally {
        setLoading(false)
      }
    }

    // No authentication check - Legal Officer pages are accessible without login
    fetchCase()
  }, [id])

  // Case data state - initialized with defaults, updated from backend
  const [caseData, setCaseData] = useState({
    id: id || 'C001',
    _id: id,
    title: '',
    student: '',
    studentId: '',
    email: '',
    status: 'Open',
    priority: 'Medium',
    date: '',
    description: '',
    category: '',
    progress: 0,
    documents: [],
    timeline: [],
    forumMessages: [],
    assignedTo: null,
    assignedToId: null,
    createdAt: '',
    updatedAt: '',
  })

  const [confidentialNotes, setConfidentialNotes] = useState([
    { 
      id: 1, 
      note: 'Initial assessment indicates need for further investigation. Student seems distressed and requires sensitive handling.', 
      author: 'John Doe', 
      date: '2024-01-17', 
      time: '10:30 AM' 
    },
    { 
      id: 2, 
      note: 'Student requested anonymity - handle with extra care. All communications must be confidential.', 
      author: 'John Doe', 
      date: '2024-01-17', 
      time: '11:00 AM' 
    },
  ])

  const handleUpdateStatus = async (newStatus) => {
    if (!caseData._id || updating) return

    try {
      setUpdating(true)
      
      // Map frontend status to backend status
      const statusMap = {
        'Open': 'open',
        'In Progress': 'inProgress',
        'Closed': 'closed',
        'Pending': 'open',
      }
      
      const backendStatus = statusMap[newStatus] || 'open'
      
      await caseService.updateCase(caseData._id, {
        status: backendStatus,
      })
      
      // Update local state
      setCaseData({ ...caseData, status: newStatus })
      setStatusModalOpen(false)
      setConfirmModalOpen(true)
      
      // Refresh case data
      const response = await caseService.getCaseById(caseData._id)
      if (response.success && response.data.case) {
        const c = response.data.case
        setCaseData(prev => ({
          ...prev,
          status: c.status === 'open' ? 'Open' : c.status === 'inProgress' ? 'In Progress' : c.status === 'closed' ? 'Closed' : 'Pending',
          updatedAt: c.updatedAt,
        }))
      }
    } catch (err) {
      console.error('Error updating case status:', err)
      alert('Failed to update case status: ' + (err.response?.data?.message || err.message))
    } finally {
      setUpdating(false)
    }
  }

  const handleAddNote = async () => {
    if (!newNote.trim()) return

    try {
      setUpdating(true)
      // For now, store notes locally. In production, you'd have a notes API endpoint
      // await caseService.addNote(caseData._id, { note: newNote })
      
      const note = {
        id: confidentialNotes.length + 1,
        note: newNote,
        author: user?.name || 'Current User',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      }
      setConfidentialNotes([note, ...confidentialNotes])
      setNewNote('')
      setNoteModalOpen(false)
      alert('Note added successfully!')
    } catch (err) {
      console.error('Error adding note:', err)
      alert('Failed to add note: ' + (err.response?.data?.message || err.message || 'Unknown error'))
    } finally {
      setUpdating(false)
    }
  }

  const handleEditNote = (noteId) => {
    const note = confidentialNotes.find(n => n.id === noteId)
    if (note) {
      setEditingNoteId(noteId)
      setEditNoteText(note.note)
      setNoteModalOpen(true)
    }
  }

  const handleSaveEditNote = async () => {
    if (!editNoteText.trim() || !editingNoteId) return

    try {
      setUpdating(true)
      // For now, update notes locally. In production, you'd have a notes API endpoint
      // await caseService.updateNote(caseData._id, editingNoteId, { note: editNoteText })
      
      setConfidentialNotes(confidentialNotes.map(note => 
        note.id === editingNoteId 
          ? { ...note, note: editNoteText }
          : note
      ))
      setEditingNoteId(null)
      setEditNoteText('')
      setNoteModalOpen(false)
      alert('Note updated successfully!')
    } catch (err) {
      console.error('Error updating note:', err)
      alert('Failed to update note: ' + (err.response?.data?.message || err.message || 'Unknown error'))
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteNote = (noteId) => {
    const note = confidentialNotes.find(n => n.id === noteId)
    setNoteToDelete(note)
    setDeleteNoteModalOpen(true)
  }

  const confirmDeleteNote = async () => {
    if (!noteToDelete) return

    try {
      setUpdating(true)
      // For now, delete notes locally. In production, you'd have a notes API endpoint
      // await caseService.deleteNote(caseData._id, noteToDelete.id)
      
      setConfidentialNotes(confidentialNotes.filter(note => note.id !== noteToDelete.id))
      setDeleteNoteModalOpen(false)
      setNoteToDelete(null)
      alert('Note deleted successfully!')
    } catch (err) {
      console.error('Error deleting note:', err)
      alert('Failed to delete note: ' + (err.response?.data?.message || err.message || 'Unknown error'))
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link to="/officer">
        <Button variant="ghost" size="sm">
          <ArrowLeft size={16} className="inline mr-2" />
          Back to Dashboard
        </Button>
      </Link>

      {/* Case Header */}
      <Card>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{caseData.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <FileText size={16} />
                Case ID: {caseData.id}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={16} />
                {caseData.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={16} />
                Progress: {caseData.progress}%
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge
              variant={
                caseData.status === 'Open'
                  ? 'success'
                  : caseData.status === 'In Progress'
                  ? 'primary'
                  : 'default'
              }
              size="lg"
            >
              {caseData.status}
            </Badge>
            <Badge
              variant={caseData.priority === 'High' ? 'danger' : 'warning'}
              size="lg"
            >
              {caseData.priority} Priority
            </Badge>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${caseData.progress}%` }}
          ></div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Case Description */}
          <Card 
            title="Case Description"
            action={
              <Button variant="outline" size="sm" onClick={() => setEditModalOpen(true)}>
                <Edit size={14} className="inline mr-1" />
                Edit
              </Button>
            }
          >
            <p className="text-gray-700 leading-relaxed mb-4">{caseData.description}</p>
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-600">
                  <strong>Category:</strong> {caseData.category}
                </span>
              </div>
            </div>
          </Card>

          {/* Confidential Notes */}
          <Card 
            title={
              <div className="flex items-center gap-2">
                <Lock size={18} />
                Confidential Notes
              </div>
            }
            action={
              <Button variant="primary" size="sm" onClick={() => {
                setEditingNoteId(null)
                setEditNoteText('')
                setNewNote('')
                setNoteModalOpen(true)
              }}>
                <Plus size={14} className="inline mr-1" />
                Add Note
              </Button>
            }
          >
            <div className="space-y-3">
              {confidentialNotes.map((note) => (
                <div key={note.id} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{note.author}</p>
                      <p className="text-xs text-gray-500">{note.date} at {note.time}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="warning" size="sm">Confidential</Badge>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditNote(note.id)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-smooth"
                          title="Edit note"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-smooth"
                          title="Delete note"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mt-2">{note.note}</p>
                </div>
              ))}
              {confidentialNotes.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No confidential notes yet.</p>
              )}
            </div>
          </Card>

          {/* Student Information */}
          <Card title="Student Information">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User size={18} className="text-gray-500" />
                <span className="text-gray-700">
                  <strong>Name:</strong> {caseData.student}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-gray-500" />
                <span className="text-gray-700">
                  <strong>Student ID:</strong> {caseData.studentId}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle size={18} className="text-gray-500" />
                <span className="text-gray-700">
                  <strong>Email:</strong> {caseData.email}
                </span>
              </div>
            </div>
          </Card>

          {/* Documents */}
          <Card title="Documents">
            <div className="space-y-3">
              {caseData.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <FileText size={20} className="text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                      <p className="text-xs text-gray-500">
                        {doc.size} • {doc.date}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      alert('Document download feature coming soon. Documents will be available once the document management system is implemented.')
                    }}
                  >
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Timeline */}
          <Card title="Case Timeline">
            <div className="space-y-4">
              {caseData.timeline.map((event, index) => (
                <div key={event.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    {index < caseData.timeline.length - 1 && (
                      <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="text-sm font-medium text-gray-900">{event.event}</p>
                    <p className="text-xs text-gray-500">
                      {event.date} • {event.user}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card title="Quick Actions">
            <div className="space-y-2">
              <Button 
                variant="primary" 
                className="w-full" 
                size="sm" 
                onClick={() => setStatusModalOpen(true)}
              >
                <Edit size={14} className="inline mr-1" />
                Update Status
              </Button>
              <Button 
                variant="outline" 
                className="w-full" 
                size="sm"
                onClick={() => {
                  alert('Document upload feature coming soon. For now, you can attach documents when updating case notes.')
                }}
              >
                <Upload size={14} className="inline mr-1" />
                Add Document
              </Button>
              <Button 
                variant="outline" 
                className="w-full" 
                size="sm"
                onClick={() => {
                  alert('Meeting scheduling feature coming soon. You can coordinate meetings through case notes or forum discussions.')
                }}
              >
                Schedule Meeting
              </Button>
            </div>
          </Card>

          {/* Confidential Forum */}
          <Card title="Confidential Forum">
            <p className="text-sm text-gray-600 mb-4">
              Private discussion area for legal officers and admins
            </p>
            <Button
              variant="primary"
              className="w-full mb-4"
              onClick={() => setForumModalOpen(true)}
            >
              <MessageSquare size={16} className="inline mr-2" />
              Open Forum
            </Button>
            <div className="space-y-3">
              {caseData.forumMessages.slice(0, 2).map((msg) => (
                <div key={msg.id} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-900 mb-1">{msg.user}</p>
                  <p className="text-sm text-gray-700">{msg.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{msg.timestamp}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Case Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false)
          setEditingNoteId(null)
        }}
        title="Edit Case Information"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={caseData.description}
              onChange={(e) => setCaseData({ ...caseData, description: e.target.value })}
              rows="6"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Progress (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={caseData.progress}
              onChange={(e) => setCaseData({ ...caseData, progress: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={async () => {
                try {
                  setUpdating(true)
                  // Map frontend status to backend status
                  const statusMap = {
                    'Open': 'open',
                    'In Progress': 'inProgress',
                    'Closed': 'closed',
                    'Pending': 'open',
                  }
                  
                  await caseService.updateCase(caseData._id, {
                    description: caseData.description,
                    status: statusMap[caseData.status] || 'open',
                    priority: caseData.priority?.toLowerCase() || 'medium',
                  })
                  
                  // Refresh case data
                  const response = await caseService.getCaseById(caseData._id)
                  if (response.success && response.data.case) {
                    const c = response.data.case
                    setCaseData(prev => ({
                      ...prev,
                      description: c.description,
                      status: c.status === 'open' ? 'Open' : c.status === 'inProgress' ? 'In Progress' : c.status === 'closed' ? 'Closed' : 'Pending',
                      priority: c.priority ? c.priority.charAt(0).toUpperCase() + c.priority.slice(1) : 'Medium',
                      updatedAt: c.updatedAt,
                    }))
                  }
                  
                  setEditModalOpen(false)
                  setConfirmModalOpen(true)
                } catch (err) {
                  console.error('Error updating case:', err)
                  alert('Failed to update case: ' + (err.response?.data?.message || err.message || 'Unknown error'))
                } finally {
                  setUpdating(false)
                }
              }}
              disabled={updating}
            >
              <Save size={14} className="inline mr-1" />
              {updating ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Update Status Modal */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title="Update Case Status"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Update status for case <strong>{caseData.id}</strong>
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Status</label>
            <select
              value={caseData.status}
              onChange={(e) => setCaseData({ ...caseData, status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Pending">Pending</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <select
              value={caseData.priority}
              onChange={(e) => setCaseData({ ...caseData, priority: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setStatusModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => handleUpdateStatus(caseData.status)}>
              <Save size={14} className="inline mr-1" />
              Update Status
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add/Edit Note Modal */}
      <Modal
        isOpen={noteModalOpen}
        onClose={() => {
          setNoteModalOpen(false)
          setEditingNoteId(null)
          setEditNoteText('')
          setNewNote('')
        }}
        title={
          <div className="flex items-center gap-2">
            <Lock size={18} />
            {editingNoteId ? 'Edit Confidential Note' : 'Add Confidential Note'}
          </div>
        }
      >
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> This note will be marked as confidential and only visible to legal officers and administrators.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Note</label>
            <textarea
              value={editingNoteId ? editNoteText : newNote}
              onChange={(e) => editingNoteId ? setEditNoteText(e.target.value) : setNewNote(e.target.value)}
              placeholder="Enter your confidential note..."
              rows="5"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => {
              setNoteModalOpen(false)
              setEditingNoteId(null)
              setEditNoteText('')
              setNewNote('')
            }}>
              Cancel
            </Button>
            <Button variant="primary" onClick={editingNoteId ? handleSaveEditNote : handleAddNote}>
              <Save size={14} className="inline mr-1" />
              {editingNoteId ? 'Save Changes' : 'Save Note'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Note Confirmation Modal */}
      <Modal
        isOpen={deleteNoteModalOpen}
        onClose={() => {
          setDeleteNoteModalOpen(false)
          setNoteToDelete(null)
        }}
        title="Delete Confidential Note"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete this confidential note? This action cannot be undone.
          </p>
          {noteToDelete && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">{noteToDelete.note}</p>
            </div>
          )}
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => {
              setDeleteNoteModalOpen(false)
              setNoteToDelete(null)
            }}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDeleteNote}>
              <Trash2 size={14} className="inline mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="Success"
        size="sm"
      >
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <p className="text-sm text-gray-600">
            Case information has been updated successfully.
          </p>
          <Button variant="primary" onClick={() => setConfirmModalOpen(false)} className="w-full">
            OK
          </Button>
        </div>
      </Modal>

      {/* Forum Modal */}
      <Modal
        isOpen={forumModalOpen}
        onClose={() => setForumModalOpen(false)}
        title="Confidential Forum Discussion"
        size="lg"
      >
        <div className="space-y-4">
          <div className="max-h-96 overflow-y-auto space-y-4">
            {caseData.forumMessages.map((msg) => (
              <div key={msg.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-900">{msg.user}</p>
                  <p className="text-xs text-gray-500">{msg.timestamp}</p>
                </div>
                <p className="text-sm text-gray-700">{msg.message}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 pt-4">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-3"
              rows="3"
            />
            <div className="flex justify-end">
              <Button 
                variant="primary" 
                onClick={async () => {
                  if (!newMessage.trim()) return

                  try {
                    setUpdating(true)
                    // For now, add message locally. In production, you'd use forumService
                    // await forumService.addComment(caseData._id, { message: newMessage })
                    
                    const message = {
                      id: caseData.forumMessages.length + 1,
                      user: user?.name || 'Current User',
                      message: newMessage,
                      timestamp: new Date().toLocaleString(),
                    }
                    setCaseData(prev => ({
                      ...prev,
                      forumMessages: [...prev.forumMessages, message]
                    }))
                    setNewMessage('')
                    setForumModalOpen(false)
                    alert('Message sent successfully!')
                  } catch (err) {
                    console.error('Error sending message:', err)
                    alert('Failed to send message: ' + (err.response?.data?.message || err.message || 'Unknown error'))
                  } finally {
                    setUpdating(false)
                  }
                }}
                disabled={updating}
              >
                {updating ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default CaseDetails






