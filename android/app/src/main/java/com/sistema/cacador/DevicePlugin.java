package com.sistema.cacador;

import android.media.MediaDrm;
import android.os.Build;
import android.provider.Settings;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.security.MessageDigest;
import java.util.UUID;

/**
 * Identificadores do aparelho para o acesso privado e os bloqueios.
 *  - drmId: identificador Widevine (hash SHA-256). É o mesmo depois de desinstalar, de limpar os dados
 *           e com APKs assinados com outra chave. Só muda com a reposição de fábrica.
 *  - androidId: ANDROID_ID. É o mesmo depois de desinstalar e instalar um APK com a mesma assinatura.
 * Nenhum dos dois precisa de permissões. O servidor só guarda hashes destes valores.
 */
@CapacitorPlugin(name = "SistemaDevice")
public class DevicePlugin extends Plugin {
    private static final UUID WIDEVINE = new UUID(0xEDEF8BA979D64ACEL, 0xA3C827DCD51D21EDL);

    @PluginMethod
    public void getIds(PluginCall call) {
        JSObject r = new JSObject();
        try {
            String aid = Settings.Secure.getString(getContext().getContentResolver(), Settings.Secure.ANDROID_ID);
            if (aid != null) r.put("androidId", aid);
        } catch (Exception e) {
            // sem ANDROID_ID
        }
        MediaDrm drm = null;
        try {
            drm = new MediaDrm(WIDEVINE);
            byte[] id = drm.getPropertyByteArray(MediaDrm.PROPERTY_DEVICE_UNIQUE_ID);
            if (id != null && id.length > 0) r.put("drmId", sha256(id));
        } catch (Throwable e) {
            // aparelho sem Widevine
        } finally {
            if (drm != null) {
                try {
                    if (Build.VERSION.SDK_INT >= 28) drm.close(); else drm.release();
                } catch (Throwable e) {
                    // ignora
                }
            }
        }
        r.put("model", (Build.MANUFACTURER + " " + Build.MODEL).trim());
        r.put("os", "Android " + Build.VERSION.RELEASE);
        r.put("sdk", Build.VERSION.SDK_INT);
        call.resolve(r);
    }

    private static String sha256(byte[] data) throws Exception {
        MessageDigest md = MessageDigest.getInstance("SHA-256");
        byte[] h = md.digest(data);
        StringBuilder sb = new StringBuilder();
        for (byte b : h) sb.append(String.format("%02x", b));
        return sb.toString();
    }
}
