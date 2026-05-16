import {
    createContext,
    useContext,
    useState,
    ReactNode,
  } from "react";
  import React from "react";
  import {
    PropertyPublishData,
  } from "../types/property-publish.types";
  
  interface PropertyPublishContextValue {
    data: PropertyPublishData;
  
    updateData: (
      values: Partial<PropertyPublishData>
    ) => void;
  
    reset: () => void;
  }
  
  const initialData: PropertyPublishData = {
    propertyId: null,
    propertyType: null,
    listingType: null,
  
    title: "",
    description: "",
  
    country: "",
    province: "",
    city: "",
    neighborhood: "",
    address: "",
  
    bedrooms: null,
    bathrooms: null,
    areaM2: null,
  
    price: null,
  
    images: [],
  };
  
  const PropertyPublishContext =
    createContext<
      PropertyPublishContextValue | undefined
    >(undefined);
  
  export function PropertyPublishProvider({
    children,
  }: {
    children: ReactNode;
  }) {
    const [data, setData] =
      useState<PropertyPublishData>(initialData);
  
    function updateData(
      values: Partial<PropertyPublishData>
    ) {
      setData((prev) => ({
        ...prev,
        ...values,
      }));
    }
  
    function reset() {
      setData(initialData);
    }
  
    return (
      <PropertyPublishContext.Provider
        value={{
          data,
          updateData,
          reset,
        }}
      >
        {children}
      </PropertyPublishContext.Provider>
    );
  }
  
  export function usePropertyPublish() {
    const context = useContext(
      PropertyPublishContext
    );
  
    if (!context) {
      throw new Error(
        "usePropertyPublish must be used inside PropertyPublishProvider"
      );
    }
  
    return context;
  }