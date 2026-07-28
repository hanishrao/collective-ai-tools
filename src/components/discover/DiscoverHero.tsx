export function DiscoverHero() {
  return (
    <header className='relative max-w-2xl'>
      <p className='mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400'>
        The AI ecosystem, in one place
      </p>
      <h1 className='text-4xl font-black leading-[1.05] tracking-tight text-gray-900 dark:text-white sm:text-6xl'>
        Discover what&apos;s{' '}
        <span className='text-blue-600 dark:text-blue-400'>
          actually worth using
        </span>
      </h1>
      <p className='mt-5 max-w-xl text-lg text-gray-500 dark:text-gray-400'>
        Search across curated tools, MCP servers, prompts, skills, and trending
        repos, one query, every corner of the ecosystem.
      </p>
    </header>
  );
}
