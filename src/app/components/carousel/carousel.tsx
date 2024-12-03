import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, A11y } from "swiper/modules";

interface CarouselProps<T> {
    items: T[];
    children: (item: T) => React.ReactNode; // Mudança aqui: recebendo uma função
}

const Carousel = <T extends { id: string }>({ items, children }: CarouselProps<T>) => {
    return (
        <Swiper
            modules={[Navigation, Pagination, A11y]}
            navigation
            pagination={{ clickable: true }}
            spaceBetween={30}
            slidesPerView={3}
            onSlideChange={() => {}}
            onSwiper={(swiper) => {}}
        >
            {items.map((item) => (
                <SwiperSlide key={item.id}>{children(item)}</SwiperSlide> // Passa o item para o children
            ))}
        </Swiper>
    );
};

export default Carousel;
