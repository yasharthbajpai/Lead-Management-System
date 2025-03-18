#!/bin/bash

# Initialize git repository
git init

# Add all files to staging, excluding those in .gitignore
git add .

# Initial commit
git commit -m "Initial commit"

# Instructions for setting up remote repository
echo "Repository initialized successfully!"
echo ""
echo "To push to GitHub, run the following commands:"
echo "git remote add origin <your-github-repository-url>"
echo "git branch -M main"
echo "git push -u origin main"
echo ""
echo "Note: Make sure you have created a repository on GitHub first." 