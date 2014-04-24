#!/usr/bin/env bash

VAGRANT_DIR=/vagrant
PROJECT_NAME=tourismyes
DB_NAME=$PROJECT_NAME

sudo apt-get update -y

# usability (can be omitted)
sudo apt-get update -y
touch $HOME/.hushlogin
sudo apt-get install expect curl zsh fortune cowsay htop git build-essential -y
wget https://github.com/robbyrussell/oh-my-zsh/raw/master/tools/install.sh -O - | zsh
sudo mkdir -p $HOME/.oh-my-zsh/custom/plugins
git clone git://github.com/zsh-users/zsh-syntax-highlighting.git  $HOME/.oh-my-zsh/custom/plugins/zsh-syntax-highlighting
sudo chsh -s `which zsh` vagrant
sed -i.bak 's/^plugins=(.*/plugins=(git zsh-syntax-highlighting)/' $HOME/.zshrc

# servers
sudo apt-get install nginx-full -y
sudo usermod -a -G vagrant www-data
sudo ln -s $VAGRANT_DIR/app/nginx.conf.vagrant-sample /etc/nginx/sites-enabled/vagrant.conf
sudo rm /etc/nginx/sites-available/default
sudo service nginx restart
echo "start on vagrant-mounted

script
  service nginx restart
end script" | sudo tee /etc/init/vagrant-fix.conf
