# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# react-native-reanimated
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# Add any project specific keep options here:

# Configuraciones para la gesture bar y áreas seguras
-keep class android.view.WindowInsets { *; }
-keep class android.view.WindowInsetsController { *; }
-keep class android.view.View { *; }
-keep class android.view.Window { *; }

# Configuraciones para React Native Safe Area Context
-keep class com.th3rdwave.safeareacontext.** { *; }
