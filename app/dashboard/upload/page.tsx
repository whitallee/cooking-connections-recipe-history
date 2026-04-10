import UploadForm from './UploadForm'

export default function UploadPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Upload Recipe</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Upload a recipe card photo to auto-fill the form, or enter the details
          manually.
        </p>
      </div>
      <UploadForm />
    </div>
  )
}
