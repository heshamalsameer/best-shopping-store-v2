const CartLoading = () => {
  return (
    <section className="fix-height container m-auto px-5 py-8 animate-pulse">
      <div className="bg-gray-300 h-9 w-56 rounded mb-6" />
      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="bg-white rounded-lg border-2 border-gray-300 divide-y-2 divide-gray-200">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 p-5">
              <div className="w-24 h-24 bg-gray-200 rounded-lg" />
              <div className="flex-1 space-y-2"><div className="h-5 bg-gray-200 rounded w-1/2" /><div className="h-4 bg-gray-200 rounded w-24" /></div>
              <div className="w-28 h-9 bg-gray-200 rounded-lg" />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-lg border-2 border-gray-300 p-5 space-y-3">
          <div className="h-6 bg-gray-200 rounded w-40" />
          <div className="h-4 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded" />
          <div className="h-12 bg-gray-300 rounded-lg mt-6" />
        </div>
      </div>
    </section>
  );
};

export default CartLoading;
