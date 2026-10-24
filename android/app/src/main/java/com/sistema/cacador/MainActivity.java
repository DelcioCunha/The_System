package com.sistema.cacador;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // identificadores do aparelho (acesso privado e bloqueios)
        registerPlugin(DevicePlugin.class);
        super.onCreate(savedInstanceState);
    }
}
