import { useState } from 'react'
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react'

export default function StatementImport() {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadComplete, setUploadComplete] = useState(false)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile)
      setUploadComplete(false)
    } else {
      alert('Please select a valid CSV file')
    }
  }

  const handleUpload = () => {
    if (!file) return
    
    setUploading(true)
    // Simulate upload process
    setTimeout(() => {
      setUploading(false)
      setUploadComplete(true)
    }, 2000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-slate-800">CSV Statement Import</h2>
        <p className="text-slate-500 mt-1">Upload your bank or UPI statement for bulk transaction import</p>
      </div>

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
              accept=".csv"
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
          {file && !uploadComplete && (
            <div className="mt-6">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold disabled:bg-slate-400"
              >
                {uploading ? 'Processing...' : 'Upload and Process'}
              </button>
            </div>
          )}

          {/* Success Message */}
          {uploadComplete && (
            <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start">
              <CheckCircle className="h-5 w-5 text-emerald-600 mr-3 mt-0.5" />
              <div>
                <p className="font-semibold text-emerald-800">Upload Successful!</p>
                <p className="text-sm text-emerald-700 mt-1">
                  Your CSV has been processed. 47 transactions imported, 3 potential duplicates detected.
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
            <p>Your CSV file should contain columns: <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">Date, Description, Amount, Category</span></p>
          </div>
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-indigo-600 mr-3 mt-0.5 flex-shrink-0" />
            <p>Date format should be: <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">YYYY-MM-DD</span> or <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">DD/MM/YYYY</span></p>
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
{`Date,Description,Amount,Category
2024-02-20,Zomato Order,-450,Food
2024-02-19,Salary Credit,30000,Income
2024-02-18,Uber Ride,-180,Travel
2024-02-17,Netflix Subscription,-199,Entertainment`}
          </pre>
        </div>
        <button className="mt-4 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
          Download Sample CSV Template
        </button>
      </div>
    </div>
  )
}
