FROM --platform=linux/amd64 node:18

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

# Install Android SDK dependencies independently of code changes for caching
RUN apt-get update && \
    apt-get install -y --no-install-recommends openjdk-17-jdk wget unzip && \
    rm -rf /var/lib/apt/lists/*

# Set up Java and Android SDK environment variables
ENV JAVA_HOME /usr/lib/jvm/java-17-openjdk-amd64
ENV ANDROID_HOME /usr/local/android-sdk
ENV PATH $JAVA_HOME/bin:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH

# Download and set up Android SDK
RUN mkdir -p $ANDROID_HOME/cmdline-tools && \
    cd $ANDROID_HOME/cmdline-tools && \
    wget https://dl.google.com/android/repository/commandlinetools-linux-7583922_latest.zip -O commandlinetools.zip && \
    unzip commandlinetools.zip && rm commandlinetools.zip && \
    mkdir -p latest && \
    mv cmdline-tools/* latest/ && \
    rm -rf cmdline-tools

COPY . .

# Accept licenses and install required Android SDK packages
RUN yes | sdkmanager --licenses && \
    sdkmanager "platform-tools" "platforms;android-33" "build-tools;33.0.0" && \
    echo "sdk.dir=$ANDROID_HOME" > /app/android/local.properties

# Prebuild the Expo project
RUN npx expo prebuild

# Build the Android APK
RUN cd android && ./gradlew assembleRelease --no-build-cache --parallel --no-daemon

CMD ["cp", "/app/android/app/build/outputs/apk/release/app-release.apk", "/app/client-apk/client.apk"]
