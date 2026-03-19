package it.sitespa.vianova;

import android.annotation.SuppressLint;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.ProgressBar;

import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {

    // URL del sito statico su GitHub Pages
    private static final String APP_URL = "https://nazlamdev.github.io/vianova/";

    private WebView webView;
    private ProgressBar progressBar;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView     = findViewById(R.id.webView);
        progressBar = findViewById(R.id.progressBar);

        // ---- WebView settings ----
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);

        // ---- WebViewClient: gestione link tel: e navigazione ----
        webView.setWebViewClient(new WebViewClient() {

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();

                // Intercetta link telefonici → apri il dialer
                if (url.startsWith("tel:")) {
                    Intent callIntent = new Intent(Intent.ACTION_DIAL);
                    callIntent.setData(Uri.parse(url));
                    startActivity(callIntent);
                    return true;
                }

                // Link mailto → apri client email
                if (url.startsWith("mailto:")) {
                    Intent emailIntent = new Intent(Intent.ACTION_SENDTO, Uri.parse(url));
                    startActivity(emailIntent);
                    return true;
                }

                // Tutto il resto rimane nel WebView
                return false;
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                progressBar.setVisibility(View.GONE);
            }

            @Override
            public void onReceivedError(WebView view, int errorCode,
                                        String description, String failingUrl) {
                progressBar.setVisibility(View.GONE);
                // Mostra pagina di errore inline
                String html = "<html><body style='font-family:sans-serif;text-align:center;padding:2rem;'>"
                        + "<h2 style='color:#dc2626'>Connessione assente</h2>"
                        + "<p style='color:#6b7280'>Verifica la connessione e ricarica l'app.</p>"
                        + "</body></html>";
                view.loadDataWithBaseURL(null, html, "text/html", "UTF-8", null);
            }
        });

        // ---- carica pagina ----
        progressBar.setVisibility(View.VISIBLE);
        webView.loadUrl(APP_URL);
    }

    // ---- Back button → naviga indietro nel WebView ----
    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
