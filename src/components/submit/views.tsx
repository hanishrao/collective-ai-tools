import { Plus } from 'lucide-react';

export function SignInPrompt({ onSignIn }: { onSignIn: () => void }) {
  return (
    <div className='min-h-[60vh] flex flex-col items-center justify-center p-4'>
      <h2 className='text-2xl font-bold mb-4 text-gray-900 dark:text-white'>
        Sign in to Submit
      </h2>
      <p className='text-gray-600 dark:text-gray-400 mb-6'>
        You need an account to submit new resources.
      </p>
      <button
        onClick={onSignIn}
        className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
      >
        Sign In
      </button>
    </div>
  );
}

export function SubmissionSuccess({
  onSubmitAnother,
}: {
  onSubmitAnother: () => void;
}) {
  return (
    <div className='max-w-2xl mx-auto py-16 px-4 text-center'>
      <div className='w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6'>
        <Plus className='h-8 w-8 text-green-600 dark:text-green-400' />
      </div>
      <h2 className='text-3xl font-bold text-gray-900 dark:text-white mb-4'>
        Submission Received!
      </h2>
      <p className='text-xl text-gray-600 dark:text-gray-300 mb-8'>
        Thank you for contributing. Your submission is under review and will be
        listed once approved.
      </p>
      <button
        onClick={onSubmitAnother}
        className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
      >
        Submit Another
      </button>
    </div>
  );
}
