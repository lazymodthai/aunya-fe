import BookManagementCard from '@components/card/BookManagementCard'
import { Box } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { ManageBookingAPI } from '@apis/manage/manage-booking'

function ManangeBooking() {
    const [bookingData, setBookingData] = useState<any[]>([])

    const fetchBookingData = async () => {
        try {
            const response = await ManageBookingAPI.getBookingList();
            setBookingData(response.data);
        } catch (error) {
            console.error('Error fetching booking data:', error);
        }
    };

    useEffect(() => {
        fetchBookingData()
    }, [])



    return (<>
        <Box>
            <BookManagementCard bookingData={bookingData.map((item) => ({
                id: item.id,
                roomId: item.refCode || "",
                checkinDate: item.checkinDate,
                checkoutDate: item.checkoutDate,
                guestNumber: item.guestNumber,
                childrenNumber: item.childrenNumber ?? null,
                additionGuestNumber: item.additionGuestNumber,
                name: item.name,
                phoneNumber: item.phoneNumber,
                totalPrice: item.totalPrice,
                status: item.status,
                remark: item.remark,
            }))}
                onClick={(id) => { console.log('id', id) }} />

        </Box>
    </>
    )
}

export default ManangeBooking