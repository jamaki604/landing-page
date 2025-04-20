"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams } from "next/navigation";
import FooterType1 from "@components/Footer/_FooterType1";
import HeaderType1 from "@components/Header/_HeaderType1";
import ContactType1 from "@components/Contact/_ContactType1";
import CallToActionType1 from "@components/CallToAction/_CallToActionType1";
import MainContentType1 from "@components/MainContent/_MainContentType1";
import TextBoxType from "@components/TextBox/_TextBox";
import Header from "@components/Header";
import CallToAction from "@components/CallToAction";
import Contact from "@components/Contact";
import MainContent from "@components/MainContent";

export const dynamic = "force-dynamic";

type PageData = {
  pageId: string;
  pageTitle: string;
  designId: string;
};

type LayerData = {
  content: string;
  styleVariant: number;
  componentType: string;
  configuration: string;
  pageId: string;
};

const PageViewer = () => {
  const { pageTitle } = useParams() as { pageTitle: string };
  const [sections, setSections] = useState<JSX.Element[]>([]);
  const [footer, setFooter] = useState<JSX.Element[]>([]);

  const parsedPageTitle = pageTitle.replace(/-/g, " ");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/data.json");
        const viewerData = await res.json();

        const page = viewerData.pagesData?.find(
          (p: PageData) => p.pageTitle === parsedPageTitle
        );

        if (!page) throw new Error("Page not found in JSON");

        const layers = viewerData.layerData
          ?.filter((l: LayerData) => l.pageId === page.pageId)
          .sort((a: LayerData, b: LayerData) => {
            try {
              const aIndex = JSON.parse(a.configuration || "{}").index || 0;
              const bIndex = JSON.parse(b.configuration || "{}").index || 0;
              return aIndex - bIndex;
            } catch {
              return 0;
            }
          });

        const rendered = layers?.map(renderSection).filter(Boolean) || [];
        setSections(rendered);

        const footerContent = viewerData.footerData;
        setFooter(footerContent ? [<FooterType1 key="footer" data={footerContent} />] : []);
      } catch (err) {
        console.error("Error rendering viewer:", err);
      }
    };

    fetchData();
  }, [parsedPageTitle]);

  const renderSection = (layer: LayerData) => {
      try {
        const layerContent = JSON.parse(layer.content);
  
        switch (layer.componentType) {
          case "Header":
            return <Header type={layer.styleVariant} data={layerContent} />;
          case "MainContent":
            return <MainContent type={layer.styleVariant} data={layerContent} />;
          case "CallToAction":
            return <CallToAction type={layer.styleVariant} data={layerContent} />;
          case "Contact":
            return <Contact type={layer.styleVariant} data={layerContent} />;
          case "TextBox":
            return <TextBoxType key={layer.componentType} data={layerContent} />;
          default:
            return null;
        }
    } catch (err) {
      console.error(`Render error (${layer.componentType}):`, err);
      return null;
    }
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div data-testid="viewer-container" className="h-full w-full">
        {sections}
        {footer}
      </div>
    </Suspense>
  );
};

export default PageViewer;
