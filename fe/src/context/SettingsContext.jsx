import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../config/api";
import { RENTAL_PERIOD_DAYS, LATE_FEE_PER_DAY } from "../config/constants";

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({
        rental_period_days: RENTAL_PERIOD_DAYS,
        late_fee_per_day: LATE_FEE_PER_DAY,
    });

    const refresh = useCallback(async () => {
        try {
            const rs = await api.get("/settings");
            if (rs.data) setSettings(rs.data);
        } catch (error) {
            // Giữ giá trị mặc định nếu không lấy được
            console.error("Failed to load settings", error);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return (
        <SettingsContext.Provider
            value={{
                rentalPeriodDays: settings.rental_period_days,
                lateFeePerDay: settings.late_fee_per_day,
                refresh,
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => useContext(SettingsContext);
