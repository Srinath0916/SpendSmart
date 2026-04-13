import { useState } from 'react'
import { Upload, FileText, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react'
import { csvAPI } from '../utils/api'

export default function StatementImport() {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState(null)
  const [error, setError] = useState('')

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      const fileName = selectedFile.name.toLowerCase()
      
      if (fileName.endsWith('.csv') || fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        setFile(selectedFile)
        setUploadResult(null)
        setError('')
      } else {
        setError('Please select a CSV or Excel file (.csv, .xlsx, .xls)')
      }
    }
  }

  const handleUpload = async () => {
    if (!file) return
    
    setUploading(true)
    setError('')
    
    try {
      const result = await csvAPI.upload(file)
      setUploadResult(result)
      
      // If there are new transactions without conflicts, auto-import them
      if (result.data.new_transactions.length > 0 && result.data.conflicts.length === 0) {
        await handleConfirmImport(result.data.new_transactions)
      }
    } catch (err) {
      setError(err.message || 'Failed to upload CSV')
    } finally {
      setUploading(false)
    }
  }

  const handleConfirmImport = async (transactions) => {
    try {
      const result = await csvAPI.confirmImport(transactions)
      setUploadResult(prev => ({
        ...prev,
        imported: true,
        importResult: result
      }))
      // Refresh the page after 2 seconds to show new transactions
      setTimeout(() => {
        window.location.href = '/dashboard/transactions'
      }, 2000)
    } catch (err) {
      setError(err.message || 'Failed to import transactions')
    }
  }

  const downloadSampleCSV = () => {
    const csvContent = `Date,Amount,Description,Category
2026-04-20,-450.00,Zomato Order,Food
2026-04-19,30000.00,Salary Credit,Income
2026-04-18,-180.00,Uber Ride,Travel
2026-04-17,-199.00,Netflix Subscription,Entertainment`
    
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
        <h2 className="text-2xl font-semibold text-slate-800">CSV Statement Import</h2>
        <p className="text-slate-500 mt-1">Upload your bank or UPI statement for bulk transaction import</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
          <div>
            <p className="font-semibold text-red-800">Upload Failed</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="max-w-2xl mx-auto">
          {/* File Upload Box */}
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center hover:border-indigo-400 transition-colors">
            <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              {file ? file.name : 'Drop your CSV file here'}
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              or click to browse from your computer
            </p>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              id="csv-upload"
            />
            <label
              htmlFor="csv-upload"
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer font-medium"
            >
              <FileText className="h-5 w-5 mr-2" />
              Select CSV File
            </label>
          </div>

          {/* Upload Button */}
          {file && !uploadResult && (
            <div className="mt-6">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold disabled:bg-slate-400 disabled:cursor-not-allowed"
              >
                {uploading ? 'Processing...' : 'Upload and Process'}
              </button>
            </div>
          )}

          {/* Upload Results */}
          {uploadResult && !uploadResult.imported && (
            <div className="mt-6 space-y-4">
              {/* Summary */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="font-semibold text-blue-800">CSV Processed Successfully!</p>
                <p className="text-sm text-blue-700 mt-1">
                  Found {uploadResult.summary.new_transactions} new transactions
                  {uploadResult.summary.conflicts > 0 && `, ${uploadResult.summary.conflicts} potential duplicates detected`}
                </p>
              </div>

              {/* Conflicts Warning */}
              {uploadResult.data.conflicts.length > 0 && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-yellow-800">Duplicate Transactions Detected</p>
                      <p className="text-sm text-yellow-700 mt-1">
                        The following transactions may already exist in your database:
                      </p>
                      <div className="mt-3 space-y-2">
                        {uploadResult.data.conflicts.map((conflict, idx) => (
                          <div key={idx} className="text-sm bg-white p-3 rounded border border-yellow-200">
                            <p className="font-medium text-slate-800">
                              {conflict.csv_row.description} - ₹{Math.abs(conflict.csv_row.amount)}
                            </p>
                            <p className="text-slate-600 text-xs mt-1">
                              Date: {conflict.csv_row.date} | Matches existing transaction from {conflict.existing_transaction.source}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Import Button */}
              {uploadResult.data.new_transactions.length > 0 && (
                <button
                  onClick={() => handleConfirmImport(uploadResult.data.new_transactions)}
                  className="w-full py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold"
                >
                  Import {uploadResult.data.new_transactions.length} New Transactions
                </button>
              )}
            </div>
          )}

          {/* Import Success */}
          {uploadResult?.imported && (
            <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start">
              <CheckCircle className="h-5 w-5 text-emerald-600 mr-3 mt-0.5" />
              <div>
                <p className="font-semibold text-emerald-800">Import Successful!</p>
                <p className="text-sm text-emerald-700 mt-1">
                  {uploadResult.importResult.created.length} transactions imported successfully. Redirecting to transactions page...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">CSV Format Requirements</h3>
        <div className="space-y-3 text-sm text-slate-600">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-indigo-600 mr-3 mt-0.5 flex-shrink-0" />
            <p>Your CSV file should contain columns: <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">Date, Amount, Description, Category</span></p>
          </div>
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-indigo-600 mr-3 mt-0.5 flex-shrink-0" />
            <p>Date format should be: <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">YYYY-MM-DD</span></p>
          </div>
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-indigo-600 mr-3 mt-0.5 flex-shrink-0" />
            <p>Negative amounts represent expenses, positive amounts represent income</p>
          </div>
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-indigo-600 mr-3 mt-0.5 flex-shrink-0" />
            <p>Our reconciliation engine will automatically detect and flag potential duplicate transactions</p>
          </div>
        </div>
      </div>

      {/* Sample CSV */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Sample CSV Format</h3>
        <div className="bg-slate-50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
          <pre className="text-slate-700">
{`Date,Amount,Description,Category
2026-04-20,-450.00,Zomato Order,Food
2026-04-19,30000.00,Salary Credit,Income
2026-04-18,-180.00,Uber Ride,Travel
2026-04-17,-199.00,Netflix Subscription,Entertainment`}
          </pre>
        </div>
        <button 
          onClick={downloadSampleCSV}
          className="mt-4 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Download Sample CSV Template
        </button>
      </div>
    </div>
  )
}
