"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, A11y } from "swiper/modules";

interface CarouselProps<T> {
    items: T[];
    children: (item: T) => React.ReactNode;
}

const Carousel = <T extends { id: string }>({ items, children }: CarouselProps<T>) => {
    return (
        <div className="w-full max-w-full overflow-hidden box-border">
            <Swiper
                className="w-full max-w-full"
            modules={[Navigation, Pagination, A11y]}
            navigation
            pagination={{ clickable: true, dynamicBullets: true }}
            breakpoints={{
                // Define diferentes valores para slidesPerView com base no tamanho da tela
                768: {
                    slidesPerView: 1, // 1 slide em telas pequenas (mobile)
                    spaceBetween: 10,
                },
                900: {
                    slidesPerView: 2, // 2 slides em telas médias (tablet)
                    spaceBetween: 20,
                },
                1200: {
                    slidesPerView: 3, // 3 slides em telas grandes (desktop)
                    spaceBetween: 30,
                },
                1600: {
                    slidesPerView: 4, // 4 slides em telas grandes (desktop)
                    spaceBetween: 40,
                }
            }}
        >
            {items.map((item) => (
                <SwiperSlide key={item.id}>{children(item)}</SwiperSlide>
            ))}
        </Swiper>
        </div>
    );
};

export default Carousel;
