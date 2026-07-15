"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

type NaverLocationMapProps = {
  address: string;
  clientId: string;
  lat: number | null;
  lng: number | null;
  mapUrl?: string;
  title: string;
};

type NaverMapApi = {
  LatLng: new (lat: number, lng: number) => unknown;
  Map: new (
    element: HTMLElement,
    options: {
      center: unknown;
      zoom: number;
      zoomControl: boolean;
      zoomControlOptions?: { position?: unknown };
    },
  ) => unknown;
  Marker: new (options: { position: unknown; map: unknown; title: string }) => unknown;
  Position?: {
    TOP_RIGHT?: unknown;
  };
};

type MapStatus = "loading" | "auth-error" | "load-error";

declare global {
  interface Window {
    naver?: {
      maps?: NaverMapApi;
    };
    navermap_authFailure?: () => void;
  }
}

const NAVER_MAP_AUTH_FAILURE_EVENT = "naver-map-auth-failure";

if (typeof window !== "undefined") {
  window.navermap_authFailure = () => {
    window.dispatchEvent(new Event(NAVER_MAP_AUTH_FAILURE_EVENT));
  };
}

export function NaverLocationMap({ address, clientId, lat, lng, mapUrl, title }: NaverLocationMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const renderedRef = useRef(false);
  const [isScriptReady, setIsScriptReady] = useState(false);
  const [status, setStatus] = useState<MapStatus>("loading");
  const canRenderMap = Boolean(clientId && lat !== null && lng !== null);

  useEffect(() => {
    const handleAuthFailure = () => {
      renderedRef.current = false;
      setStatus("auth-error");
    };

    window.addEventListener(NAVER_MAP_AUTH_FAILURE_EVENT, handleAuthFailure);

    return () => {
      window.removeEventListener(NAVER_MAP_AUTH_FAILURE_EVENT, handleAuthFailure);
    };
  }, []);

  useEffect(() => {
    if (
      !canRenderMap ||
      !isScriptReady ||
      renderedRef.current ||
      !mapRef.current ||
      !window.naver?.maps ||
      lat === null ||
      lng === null
    ) {
      return;
    }

    try {
      const maps = window.naver.maps;
      const center = new maps.LatLng(lat, lng);
      const map = new maps.Map(mapRef.current, {
        center,
        zoom: 16,
        zoomControl: true,
        zoomControlOptions: {
          position: maps.Position?.TOP_RIGHT,
        },
      });

      new maps.Marker({
        position: center,
        map,
        title,
      });

      renderedRef.current = true;
    } catch {
      queueMicrotask(() => setStatus("load-error"));
    }
  }, [canRenderMap, isScriptReady, lat, lng, title]);

  const mapErrorMessage =
    status === "auth-error"
      ? "신규 Maps Application의 Client ID와 Web 서비스 URL 등록을 확인해 주세요."
      : "네이버지도를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.";

  return (
    <div className="location-map">
      {canRenderMap ? (
        <>
          <Script
            id="naver-map-script"
            src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(clientId)}`}
            strategy="afterInteractive"
            onLoad={() => setIsScriptReady(true)}
            onReady={() => setIsScriptReady(true)}
            onError={() => setStatus("load-error")}
          />
          <div className="location-map__viewport">
            <div className="location-map__canvas" ref={mapRef} aria-label={`${title} 네이버지도`} />
            {status === "auth-error" || status === "load-error" ? (
              <div className="location-map__status" role="status">
                <p>네이버지도 연결을 확인해 주세요</p>
                <span>{mapErrorMessage}</span>
                {mapUrl ? (
                  <a className="location-map__link" href={mapUrl} target="_blank" rel="noreferrer">
                    네이버지도에서 확인
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>
        </>
      ) : (
        <div className="location-map__placeholder">
          <p>{clientId ? "회사 좌표 입력 필요" : "지도 연결 준비 중"}</p>
          <span>
            {clientId
              ? "회사 위도와 경도를 입력하면 이 영역에 네이버지도가 표시됩니다."
              : "네이버지도 Client ID와 회사 좌표를 입력하면 지도가 표시됩니다."}
          </span>
          {mapUrl ? (
            <a className="location-map__link" href={mapUrl} target="_blank" rel="noreferrer">
              네이버지도에서 확인
            </a>
          ) : null}
        </div>
      )}
      <div className="location-map__caption">
        <strong>{title}</strong>
        <span>{address}</span>
      </div>
    </div>
  );
}
