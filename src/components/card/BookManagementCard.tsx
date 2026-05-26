import { Box, Button, Typography } from '@mui/material'
import { FormatDate, formatDateTime } from '@utils/date';
import React from 'react'
import { useTranslation } from 'react-i18next';

interface BookingData {
    id: string
    roomId: string;
    checkinDate: string;
    checkoutDate: string;
    guestNumber: number;
    childrenNumber: number | null;
    additionGuestNumber: number | null;
    name: string;
    phoneNumber: string;
    totalPrice: string;
    status: string;
    remark?: string;
}
interface BookManagementCardProps {
    bookingData: BookingData[]
    onClick: (id: string) => void

}
function BookManagementCard({ bookingData, onClick }: BookManagementCardProps) {
    const { t } = useTranslation();
    const ColorStatus = (status: string) => {
        switch (status) {
            case "Pending":
                return "#aea3a4ff"
            case "Confirmed":
                return "#42c946ff"

            default:
            // code block
        }
    }
    return (
        <Box>
            <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'flex-start', pl: 4 }}>
                {bookingData.map((item, index) => (
                    <Box key={index} sx={{ border: '1px solid #984444ff', p: 2, width: '350px', flexShrink: 0, flexGrow: 0 }}>
                        <Box display="flex" gap={2} mb={1}>
                            <Typography variant="body2" sx={{ fontWeight: 600, minWidth: '100px' }}>
                                {t('card.refCode')}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {item.roomId}
                            </Typography>
                        </Box>
                        <Box display="flex" gap={2} mb={1}>
                            <Typography variant="body2" sx={{ fontWeight: 600, minWidth: '100px' }}>
                                {t('card.checkin')}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {FormatDate(item.checkinDate)}
                            </Typography>
                        </Box>
                        <Box display="flex" gap={2} mb={1}>
                            <Typography variant="body2" sx={{ fontWeight: 600, minWidth: '100px' }}>
                                {t('card.checkout')}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {FormatDate(item.checkoutDate)}
                            </Typography>
                        </Box>
                        <Box display="flex" gap={2} mb={1}>
                            <Typography variant="body2" sx={{ fontWeight: 600, minWidth: '100px' }}>
                                {t('card.adults')}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {t('card.peopleCount', { count: item.guestNumber })}{item.childrenNumber ? t('card.extraBedCount', { child: item.childrenNumber }) : ''}
                            </Typography>
                        </Box>
                        <Box display="flex" gap={2} mb={1}>
                            <Typography variant="body2" sx={{ fontWeight: 600, minWidth: '100px' }}>
                                {t('card.extraGuests')}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {item.additionGuestNumber ?? '-'}
                            </Typography>
                        </Box>
                        <Box display="flex" gap={2} mb={1}>
                            <Typography variant="body2" sx={{ fontWeight: 600, minWidth: '100px' }}>
                                {t('card.name')}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {item.name}
                            </Typography>
                        </Box>
                        <Box display="flex" gap={2} mb={1}>
                            <Typography variant="body2" sx={{ fontWeight: 600, minWidth: '100px' }}>
                                {t('card.phone')}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {item.phoneNumber}
                            </Typography>
                        </Box>
                        <Box display="flex" gap={2} mb={1}>
                            <Typography variant="body2" sx={{ fontWeight: 600, minWidth: '100px' }}>
                                {t('card.totalPrice')}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {item.totalPrice} {t('success.thb')}
                            </Typography>
                        </Box>
                        <Box display="flex" gap={2} alignItems={"center"}>
                            <Typography variant="body2" sx={{ fontWeight: 600, minWidth: '100px' }}>
                                {t('card.status')}
                            </Typography>
                            <Box sx={{ backgroundColor: ColorStatus(item.status),p:1, borderRadius: '24px' }} display={"flex"} alignItems={"center"} justifyContent={"center"}>
                                {item.status}
                            </Box>
                            {item.status === "Pending" && (
                                <Button variant="contained" color="primary" onClick={() => onClick(item.id)} sx={{ borderRadius: '24px' }}>
                                    {t('booking.buttons.confirm')}
                                </Button>
                            )}
                        </Box>
                        {item.remark && (
                            <Box display="flex" gap={2} mt={1}>
                                <Typography variant="body2" sx={{ fontWeight: 600, minWidth: '100px', color: 'text.secondary' }}>
                                    {t('card.remark')}
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>
                                    {item.remark}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                ))}
            </Box>
        </Box>
    )
}

export default BookManagementCard