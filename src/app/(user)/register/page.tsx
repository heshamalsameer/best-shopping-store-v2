import RegisterForm from "./RegisterForm";

const RegisterPage = () => {
  return (
    <section className="fix-height container m-auto px-7 flex items-center justify-center">
      <div className="fade-up m-auto bg-white rounded-lg p-6 w-full md:w-2/3 lg:w-1/2 border-2 border-gray-300 my-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-5">
          Create New Account
        </h1>
        <RegisterForm />
      </div>
    </section>
  );
};

export default RegisterPage;
