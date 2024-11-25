import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Swiper, SwiperSlide, useSwiper } from "swiper/react";
import { Navigation, Pagination, A11y } from "swiper/modules";
import Product from "@/app/entities/product/product";
import ProductCard from "./card-product";

interface CarouselProductsProps {
    products: Product[];
}

export default function CarouselProducts ({ products }: CarouselProductsProps) {
    const swiper = useSwiper();

    return (
        <Swiper
            modules={[Navigation, Pagination, A11y]}
            navigation
            pagination={{ clickable: true }}
            spaceBetween={30}
            slidesPerView={3}
            onSlideChange={() => console.log('slide change')}
            onSwiper={(swiper) => console.log(swiper)}
        >
            {products.map((product) => (
                <SwiperSlide key={product.id}><ProductCard product={product} /></SwiperSlide>
            ))}
        </Swiper>
    )
};