import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { Listing } from "@/types";

interface AreaItem {
  id: string;
  name: string;
  city: string;
  image: string;
  districtParam: string;
  cityParam: string;
}

const areas: AreaItem[] = [
  {
    id: "hai-chau",
    name: "Quận Hải Châu - Trung tâm",
    city: "TP. Đà Nẵng",
    image:
      "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&auto=format&fit=crop&q=80",
    districtParam: "Quận Hải Châu",
    cityParam: "TP. Đà Nẵng",
  },
  {
    id: "son-tra",
    name: "Quận Sơn Trà - Biển Mỹ Khê",
    city: "TP. Đà Nẵng",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80",
    districtParam: "Quận Sơn Trà",
    cityParam: "TP. Đà Nẵng",
  },
  {
    id: "thanh-khe",
    name: "Quận Thanh Khê",
    city: "TP. Đà Nẵng",
    image:
      "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&auto=format&fit=crop&q=80",
    districtParam: "Quận Thanh Khê",
    cityParam: "TP. Đà Nẵng",
  },
  {
    id: "ngu-hanh-son",
    name: "Quận Ngũ Hành Sơn",
    city: "TP. Đà Nẵng",
    image:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80",
    districtParam: "Quận Ngũ Hành Sơn",
    cityParam: "TP. Đà Nẵng",
  },
];

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
}

export function PopularAreas({ listings = [] }: { listings?: Listing[] }) {
  const countByDistrict = (districtParam: string) => {
    const target = normalizeText(districtParam);
    return listings.filter((l) => {
      const haystack = normalizeText(`${l.address} ${l.district} ${l.city}`);
      return haystack.includes(target);
    }).length;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {areas.map((area) => {
        const realCount = countByDistrict(area.districtParam);
        return (
          <Link
            key={area.id}
            href={`/listings?district=${encodeURIComponent(
              area.districtParam
            )}&city=${encodeURIComponent(area.cityParam)}`}
            className="group relative h-72 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer"
          >
            <Image
              src={area.image}
              alt={area.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />

            <div className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowUpRight className="h-4 w-4" />
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
              <div className="flex items-center gap-1 text-xs text-white/80 mb-1">
                <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                <span>{area.city}</span>
              </div>
              <h3 className="font-heading text-lg font-bold group-hover:text-emerald-300 transition-colors">
                {area.name}
              </h3>
              <p className="text-xs text-white/80 mt-0.5">
                {realCount > 0
                  ? `${realCount} chỗ ở đang có trên hệ thống`
                  : "Xem phòng khu vực này"}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
