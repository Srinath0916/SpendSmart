import { useState } from 'react'
import { Upload, FileText, AlertCircle, CheckCircle, AlertTriangle, FileSpreadsheet } from 'lucide-react'
import { statementAPI } from '../utils/api'

export default function StatementImport() {
  const [file, setFile] = useState(null)
  const [password, setPassword] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState(null)
  const [error, setError] = useState('')
  const [conflictResolutions, setConflictResolutions] = useState({})
  const [showPasswordInput, setShowPasswordInput] = useState(false)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      const fileName = selectedFile.name.toLowerCase()
      
      if (fileName.endsWith('.csv') || fileName.endsWith('.pdf')) {
        setFile(selectedFile)
        setUploadResult(null)
        setError('')
        // Show password input for PDFs
        setShowPasswordInput(fileName.endsWith('.pdf'))
        setPassword('')
      } else {
        setError('Please select a CSV or PDF file')
      }
    }
  }

  const handleUpload = async () => {
    if (!file) return
    
    setUploading(true)
    setError('')
    
    try {
      const result = await statementAPI.upload(file, password)
      setUploadResult(result)
      
      // Initialize conflict resolutions
      const initialResolutions = {}
      result.data.conflicts.forEach((conflict, idx) => {
        initialResolutions[idx] = 'keep_existing'
      })
      setConflictResolutions(initialResolutions)
    } catch (err) {
      setError(err.message || 'Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

  const handleConflictChoice = (index, action) => {
    setConflictResolutions(prev => ({
      ...prev,
      [index]: action
    }))
  }

  const handleFinalImport = async () => {
    try {
      setUploading(true)
      setError('')
      
      // Prepare conflict resolutions
      const resolutions = uploadResult.data.conflicts.map((conflict, idx) => ({
        existing_id: conflict.existing.id,
        action: conflictResolutions[idx],
        uploaded_data: conflict.uploaded
      }))
      
      await statementAPI.resolveConflicts(
        uploadResult.data.new_transactions,
        resolutions
      )
      
      // Show success message
      alert(`Successfully imported ${uploadResult.data.new_transactions.length} new transactions!`)
      
      // Reset form
      setFile(null)
      setUploadResult(null)
      setConflictResolutions({})
      
    } catch (err) {
      setError(err.message || 'Failed to import transactions')
    } finally {
      setUploading(false)
    }
  }

  const downloadSampleCSV = () => {
    const csvContent = `Date,Amount,Description,Category
2026-04-20,-450.00,Swiggy Order,Food
2026-04-19,30000.00,Salary Credit,Income
2026-04-18,-180.00,Uber Ride,Travel`
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sample_transactions.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-slate-800">Bank Statement Import</h2>
        <p className="text-slate-500 mt-1">Upload CSV or PDF bank statements for bulk transaction import</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-red-800">Upload Failed</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div className="bg-white rounded-lg shadow-sm p-8 border border-slate-200">
        <div className="max-w-2xl mx-auto">
          {/* File Upload Box */}
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center hover:border-indigo-400 transition-colors bg-slate-50">
            <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              {file ? file.name : 'Drop your CSV or PDF file here'}
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Supports both CSV and PDF bank statements
            </p>
            <input
              type="file"
              accept=".csv,.pdf"
              onChange={handleFileChange}
              className="hidden"
              id="statement-upload"
            />
            <label
              htmlFor="statement-upload"
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer font-medium"
            >
              <FileText className="h-5 w-5 mr-2" />
              Select File
            </label>
          </div>

          {/* Upload Button */}
          {file && !uploadResult && (
            <div className="mt-6 space-y-4">
              {/* Password Input for PDFs */}
              {showPasswordInput && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    PDF Password (if protected)
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter PDF password"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  />
                  <p className="text-xs text-slate-500 mt-1">Leave blank if PDF is not password-protected</p>
                </div>
              )}
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setFile(null)
                    setError('')
                    setPassword('')
                    setShowPasswordInput(false)
                  }}
                  className="flex-1 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex-1 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold disabled:bg-slate-400 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Processing...' : 'Upload and Process'}
                </button>
              </div>
            </div>
          )}

          {/* Upload Results */}
          {uploadResult && (
            <div className="mt-6 space-y-4">
              {/* Summary */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-800">
                      {uploadResult.file_type.toUpperCase()} Processed Successfully!
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      Found {uploadResult.summary.total} transactions: {uploadResult.summary.new_transactions} new, {uploadResult.summary.conflicts} duplicates
                    </p>
                  </div>
                </div>
              </div>

              {/* Conflicts */}
              {uploadResult.data.conflicts.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center text-amber-700 mb-2">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    <h3 className="font-semibold">Duplicate Transactions Found</h3>
                  </div>
                  
                  {uploadResult.data.conflicts.map((conflict, idx) => (
                    <div key={idx} className="bg-white border border-amber-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {/* Existing */}
                        <div className="bg-slate-50 p-3 rounded border border-slate-200">
                          <p className="text-xs text-slate-500 mb-1">Your Existing Entry</p>
                          <p className="font-medium text-slate-800">{conflict.existing.description}</p>
                          <p className="text-sm text-slate-600 mt-1">
                            {conflict.existing.date} • ₹{Math.abs(parseFloat(conflict.existing.amount))}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            Source: {conflict.existing.source} • {conflict.existing.category_name || 'Uncategorized'}
                          </p>
                        </div>

                        {/* Uploaded */}
                        <div className="bg-indigo-50 p-3 rounded border border-indigo-200">
                          <p className="text-xs text-indigo-600 mb-1">From Uploaded File</p>
                          <p className="font-medium text-slate-800">{conflict.uploaded.description}</p>
                          <p className="text-sm text-slate-600 mt-1">
                            {conflict.uploaded.date} • ₹{Math.abs(parseFloat(conflict.uploaded.amount))}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleConflictChoice(idx, 'keep_existing')}
                          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                            conflictResolutions[idx] === 'keep_existing'
                              ? 'bg-slate-600 text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          Keep My Entry
                        </button>
                        <button
                          onClick={() => handleConflictChoice(idx, 'replace')}
                          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                            conflictResolutions[idx] === 'replace'
                              ? 'bg-indigo-600 text-white'
                              : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                          }`}
                        >
                          Replace with Upload
                        </button>
                        <button
                          onClick={() => handleConflictChoice(idx, 'keep_both')}
                          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                            conflictResolutions[idx] === 'keep_both'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                          }`}
                        >
                          Keep Both
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Final Import Button */}
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setFile(null)
                    setUploadResult(null)
                    setConflictResolutions({})
                    setError('')
                  }}
                  className="flex-1 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFinalImport}
                  disabled={uploading}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold disabled:bg-slate-400"
                >
                  {uploading ? 'Importing...' : `Import ${uploadResult.summary.new_transactions} New Transaction${uploadResult.summary.new_transactions !== 1 ? 's' : ''}`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Supported Formats</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3">
            <FileSpreadsheet className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-slate-800">CSV Files</p>
              <p className="text-sm text-slate-600 mt-1">
                Columns: Date, Amount, Description, Category
              </p>
              <button 
                onClick={downloadSampleCSV}
                className="text-sm text-indigo-600 hover:text-indigo-700 mt-2"
              >
                Download Sample CSV
              </button>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <FileText className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-slate-800">PDF Statements</p>
              <p className="text-sm text-slate-600 mt-1">
                Automatically extracts Date, Amount, and Description
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
