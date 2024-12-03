import Link from "next/link";

const NotFound = () => {

    return (
        <div className="flex justify-center items-center h-screen bg-gradient-to-r from-blue-500 to-teal-500">
            <div className="text-center max-w-md">
                <h1 className="text-6xl font-extrabold text-white animate-bounce">404</h1>
                <p className="mt-4 text-xl text-white">Oops! A página que você está procurando não foi encontrada.</p>
                <p className="mt-2 text-md text-white">Parece que você se perdeu no caminho...</p>

                <div className="mt-6">
                    <Link href={"/"}
                        className="px-6 py-3 bg-white text-teal-600 font-bold rounded-full shadow-lg hover:bg-teal-100 transition-all duration-300 transform hover:scale-105"
                    >
                        Voltar para a Página Inicial
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
