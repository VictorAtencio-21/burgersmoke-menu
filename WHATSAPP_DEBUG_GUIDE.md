# WhatsApp Message Sending Debug Guide

## Common Issues and Solutions

### 1. **Missing WhatsApp Number Configuration**

**Problem**: `WHATSAPP_NUMBER` is empty or undefined
**Solution**: Set the environment variable in your `.env.local` file:
```
NEXT_PUBLIC_WHATSAPP_ORDER_NUMBER=584141234567
```

**Debug Steps**:
- Check browser console for "WhatsApp URL length" logs
- Verify the number format (should be international without +)
- Ensure the environment variable is properly loaded

### 2. **Message Length Exceeded**

**Problem**: WhatsApp has a ~2000 character limit for URL parameters
**Solution**: The code now checks for this and shows an error message
**Debug Steps**:
- Check console logs for "Message length" and "Encoded message length"
- If message is too long, consider:
  - Reducing order items
  - Shortening customer notes
  - Removing excluded ingredients from message

### 3. **Invalid Phone Number Format**

**Problem**: Phone number doesn't meet WhatsApp requirements
**Solution**: Ensure number is in international format (e.g., 584141234567)
**Debug Steps**:
- Check if number has country code
- Remove any special characters (+, -, spaces)
- Verify number length (should be 10+ digits)

### 4. **Cloudinary Upload Failures**

**Problem**: Payment screenshot upload fails
**Solution**: Configure Cloudinary environment variables:
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

**Debug Steps**:
- Check browser network tab for upload requests
- Verify Cloudinary credentials
- Ensure upload preset "comprobantes" exists in Cloudinary

### 5. **Browser Popup Blocked**

**Problem**: `window.open()` returns null
**Solution**: Allow popups for your domain
**Debug Steps**:
- Check browser popup blocker settings
- Try opening WhatsApp manually with the generated URL
- Check console for "Error al Abrir WhatsApp" message

### 6. **Special Characters in Message**

**Problem**: Accents, emojis, or special characters break the URL
**Solution**: The code uses `encodeURIComponent()` to handle this
**Debug Steps**:
- Check if message contains unusual characters
- Verify encoding is working properly
- Test with simple ASCII text first

### 7. **Network Connectivity Issues**

**Problem**: Upload or WhatsApp opening fails due to network
**Solution**: Check internet connection and try again
**Debug Steps**:
- Check browser network tab
- Verify Cloudinary API is accessible
- Test WhatsApp web manually

## Testing Checklist

- [ ] Environment variables are set correctly
- [ ] WhatsApp number is in correct format
- [ ] Cloudinary credentials are valid
- [ ] Payment screenshot is selected
- [ ] Customer information is complete
- [ ] Message length is under 1800 characters (encoded)
- [ ] Browser allows popups
- [ ] Internet connection is stable

## Console Debug Information

The code now logs these values to help with debugging:
- Receipt URL from Cloudinary
- WhatsApp URL length
- Message length (original)
- Encoded message length
- Any errors during the process

## Manual Testing

If automatic opening fails, you can:
1. Copy the WhatsApp URL from console logs
2. Open it manually in a new tab
3. Verify the message appears correctly in WhatsApp

## Environment Variables Required

Create a `.env.local` file with:
```
NEXT_PUBLIC_WHATSAPP_ORDER_NUMBER=584141234567
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

Replace with your actual values. 